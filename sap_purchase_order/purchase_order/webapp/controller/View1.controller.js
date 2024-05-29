sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "../util/Formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, Formatter, ODataModel) {
        "use strict";

        return Controller.extend("purchaseorder.controller.View1", {
            formatter: Formatter,

            onInit: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oView = this.getView();
                
                var sFirstPurchaseOrderPath = "/A_PurchaseOrder('4500000000')";

                this.getView().byId("purchaseOrderHeader").bindElement({
                    path: sFirstPurchaseOrderPath,
                    parameters: {
                        expand: "to_PurchaseOrderItem"
                    },
                    events: {
                        dataRequested: function () {
                        },
                        dataReceived: function (oData) {
                            if (!oData.getParameter("data")) {
                                MessageToast.show("Purchase Order not found.");
                            }
                        }
                    }
                });

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
                //console.log(oEvent.getSource().getBindingContext().getObject());
                var oView = this.getView();
                var PurchaseOrder = oEvent.getSource().getBindingContext().getObject();
                var oModel = this.getOwnerComponent().getModel(`/A_PurchaseOrder('${PurchaseOrder}')`);
                console.log(oModel);
                oView.setModel(oModel, "selectedPurchaseOrder");
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
