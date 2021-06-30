import axios from "axios";
import unescape from "./helpers/unescape";

let loaded = false;
let translations = {};

export async function load() {
    const loadedTranslations = await axios
        .get("/?view=translations", {
            responseType: "json"
        })
        .then((response) => response.data);

    loaded = true;
    translations = loadedTranslations;

    document.dispatchEvent(
        new CustomEvent("theme:translations:loaded", {
            detail: {
                translations: loadedTranslations
            }
        })
    );
}

export function get(name, params = {}) {
    if(!loaded) {
        throw new Error("You must load translations");
    }

    try {
        const translation = name.split(".").reduce((translations, key) => {
            if (translations.hasOwnProperty(key)) {
                return translations[key];
            }

            throw new Error("Translation missed");
        }, translations);

        return Object.keys(params).reduce((result = "", key) => {
            let regex = new RegExp(`{{(\\s+)?(${key})(\\s+)?}}`, "gm");

            return result.replace(regex, params[key]);
        }, unescape(translation));
    } catch (e) {}

    return `"${name}" translation missed`;
}

export function all() {
    if(!loaded) {
        throw new Error("You must load translations");
    }

    return translations;
}

export default {
    load,
    get,
    all
};