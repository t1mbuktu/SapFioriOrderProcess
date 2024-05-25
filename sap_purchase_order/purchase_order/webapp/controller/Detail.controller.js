sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, ODataModel) {
    "use strict";

    return Controller.extend("purchaseorder.controller.Detail", {
        onInit: function () {
            // Access the existing model defined in manifest.json
            var oModel = this.getOwnerComponent().getModel();
        
            // Temporary path to access the first purchase order
            var sFirstPurchaseOrderPath = "/A_PurchaseOrder('4500000000')";
        
            this.getView().byId("purchaseOrderHeader").bindElement({
                path: sFirstPurchaseOrderPath,
                parameters: {
                    expand: "to_PurchaseOrderItem"
                },
                events: {
                    dataRequested: function () {
                        // You can add a busy indicator here if needed
                    },
                    dataReceived: function (oData) {
                        if (!oData.getParameter("data")) {
                            MessageToast.show("Purchase Order not found.");
                        }
                    }
                }
            });
        }              
    });
});
