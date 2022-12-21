import axios from "axios";
import unescape from "./helpers/unescape";

let loaded = false;
let translations = {};

export const EVENT_THEME_TRANSLATIONS_LOADED = "theme:translations:loaded";
export const EVENT_THEME_TRANSLATIONS_FAILED = "theme:translations:failed";

export async function load() {
    window.theme = window.theme || {};
    window.theme.translations_loaded = false;

    try {
        const loadedTranslations = await axios
            .get("/?view=translations", {
                responseType: "json"
            })
            .then((response) => response.data);

        loaded = true;
        translations = loadedTranslations;

        window.theme.translations_loaded = true;
        window.theme.translations = {
            ...(window.theme.translations || {}),
            ...loadedTranslations,
        }

        document.dispatchEvent(
            new CustomEvent(EVENT_THEME_TRANSLATIONS_LOADED, {
                detail: {
                    loaded: loaded,
                    translations: loadedTranslations
                }
            })
        );
    } catch (error) {
        window.theme = window.theme || {};
        window.theme.translations_loaded = false;
        window.theme.translations = {
            ...(window.theme.translations || {}),
        }

        document.dispatchEvent(
            new CustomEvent(EVENT_THEME_TRANSLATIONS_FAILED, {
                detail: {
                    loaded: false,
                    error: error,
                }
            })
        );
    }
}

export function get(name, params = {}) {
    const translations = this.translations || {};
    if (!name) {
        return `translation name must be provided missed`;
    }

    try {
        const translation = (name.split(".") || []).reduce((translations, key) => {
            if (Object.keys(translations).includes(key)) {
                return translations[key];
            }

            throw new Error("Translation missed");
        }, translations);

        const unescaped_translation = unescape(translation);
        if (!params) {
            return unescaped_translation;
        }

        if (!Object.keys(params).length) {
            return unescaped_translation;
        }

        return Object.keys(params).filter((key) => {
            return !!key;
        }).filter((key) => {
            return ![undefined, null].includes(params[key]);
        }).reduce((result = "", key) => {
            let regex = new RegExp(`{{(\s+)?(${key})(\s+)?}}`, "gm");

            const value = params[key].replace(/$/gm, "$$");

            return result.replace(regex, value);
        }, unescaped_translation);
    } catch (e) {}

    return `"${name}" translation missed`;
}

export function all() {
    const translations_loaded = loaded || (window.theme || {})['translations_loaded'] || false;

    if (!translations_loaded) {
        throw new Error("You must load translations");
    }

    return translations;
}

export default {
    load,
    get,
    all
};