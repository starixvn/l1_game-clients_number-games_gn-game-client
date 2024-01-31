import * as Sentry from "@sentry/nextjs";

export const setUser = (user) => {
    if (user) {
        setTimeout(function () {
            try {
                Sentry.configureScope(function (scope) {
                    scope.setUser(user);
                });
            } catch (ex) {
                console.log(ex);
            }
        }, 5000);
    }
};

export const setCharacterName = (name: string) => {
    setTag({ id: "character-name", value: name });
};

const setTag = (tag) => {
    if (tag) {
        try {
            Sentry.configureScope(function (scope) {
                scope.setTag(tag.id, tag.value);
            });
        } catch (ex) {
            console.log(ex);
        }
    }
};
