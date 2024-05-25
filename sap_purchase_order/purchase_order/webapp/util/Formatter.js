sap.ui.define([], function() {
    "use strict";

    return {
        dateToText: function(date) {
            if (!date) {
                return "";
            }

            const today = new Date();
            const givenDate = new Date(date);
            const oneDay = 24 * 60 * 60 * 1000;

            const diffDays = Math.round((today - givenDate) / oneDay);

            if (diffDays === 0) {
                return "today";
            } else if (diffDays === 1) {
                return "yesterday";
            } else if (diffDays > 1 && diffDays < 7) {
                return `${diffDays} days ago`;
            } else {
                return givenDate.toLocaleDateString();
            }
        }
    };
});