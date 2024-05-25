sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "../util/Formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, Formatter) {
        "use strict";

        return Controller.extend("purchaseorder.controller.List", {
            formatter: Formatter,

            onInit: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oView = this.getView();

                oView.setModel(oModel);

                var oViewModel = new JSONModel({
                    itemCount: 0
                });

                oView.setModel(oViewModel, "viewModel");

                this.setItemCount();
            },

            onSearch: function (oEvent) {
                var aFilters = [];
                var sQuery = oEvent.getSource().getValue();
                console.log(sQuery);
                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter("PurchaseOrder", FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                }

                var oList = this.byId("OrdersList");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters, "Application");
            },

            onListItemPressed: function (oEvent) {
                console.log(oEvent.getSource())
            },

            setItemCount: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oView = this.getView();

                oModel.read("/A_PurchaseOrder", {
                    success: function (oData) {
                        var iLength = oData.results.length;
                        oView.getModel("viewModel").setProperty("/itemCount", iLength);
                    },
                    error: function () {
                    }
                });
            },
        });
    });
