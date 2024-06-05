sap.ui.define([], function() {
    "use strict";
    return {
        calculateTotalNetPrice: function(items) {
            if (!items || items.length === 0) return "0.00";
            var total = items.reduce(function(sum, item) {
                return sum + parseFloat(item.NetPriceAmount);
            }, 0);
            return total.toFixed(2); 
        }
    };
});