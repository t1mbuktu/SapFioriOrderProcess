sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "../util/DateFormatter",
    "../util/PriceFormatter"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, DateFormatter, PriceFormatter) {
        "use strict";

        return Controller.extend("purchaseorder.controller.View1", {
            DateFormatter: DateFormatter,
            PriceFormatter: PriceFormatter,

            onInit: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oView = this.getView();

                const that = this;

                oModel.read(`/A_PurchaseOrder`, {
                    urlParameters: {
                        "$expand": "to_PurchaseOrderItem,to_PurchaseOrderNote"
                    },
                    success: function(data, response) {
                        var jsonModel = new JSONModel(data.results);
                        console.log(jsonModel)
                        that.getOwnerComponent()
                            .getModel("purchaseOrders")
                            .setData(jsonModel);
                    },
                    error: function(oError) {
                        console.log(oError);
                    }
                });

                var oViewModel = new JSONModel({
                    itemCount: 0
                });

                oView.setModel(oViewModel, "viewModel");

                this.setItemCount();
            },

            onSearch: function (oEvent) {
                var aFilters = [];
                var sQuery = oEvent.getSource().getValue();

                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter("Supplier", FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                }

                var oList = this.byId("OrdersList");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters, "Application");
            },

            onListItemPressed: function (oEvent) {
                var purchaseOrderId = oEvent.getSource().getBindingContext("purchaseOrders").getObject().PurchaseOrder;                
                var oModelPurchaseOrder = this.getOwnerComponent().getModel()
                var that = this;
                oModelPurchaseOrder
                    .read(`/A_PurchaseOrder('${purchaseOrderId}')`, {
                        urlParameters: {
                            "$expand": "to_PurchaseOrderItem,to_PurchaseOrderNote"
                        },
                        success: function(data, response) {
                            var jsonModel = new JSONModel(data);
                            that.getOwnerComponent()
                                .getModel("selectedPurchaseOrder")
                                .setData(jsonModel);
                            that.setPurchaseOrderCounts(); 
                            
                            console.log(data)

                            var purchaseOrderItems = data.to_PurchaseOrderItem.results;
                            var purchaseOrderItemsModel = new JSONModel(purchaseOrderItems);
                            that.getView().setModel(purchaseOrderItemsModel, "purchaseOrderItems");

                            that.getView().getModel("viewModel").setProperty("/currentItemIndex", 0);
                            that.updateSelectedPurchaseOrderItem(0);
                        },
                        error: function(oError) {
                            console.log(oError);
                        }
                    })

               
               
            },

            onApprove: function (oEvent) {
                var oModel = this.getOwnerComponent().getModel();
                var oModelPo = this.getView().getModel("selectedPurchaseOrder");
                var purchaseOrderId = oModelPo.getProperty("/oData/PurchaseOrder");

                // CSRF-Token abrufen
                var token = oModel.getSecurityToken();

                // Erstellen der URL für die POST-Anfrage
                var sUrl = "/sap/opu/odata/sap/ZOSO_PURCHASEORDER/release";
                sUrl += "?sap-client=100";
                sUrl += "&PurchaseOrder='" + purchaseOrderId + "'";
                sUrl += "&x-csrf-token=" + token;

                // Festlegen der Header für die POST-Anfrage
                var oHeaders = {
                    "X-Requested-With": "XMLHttpRequest",
                    "x-csrf-token": token
                };

                $.ajax({
                    url: sUrl,
                    method: "POST",
                    headers: oHeaders,
                    success: function (oData, response) {
                        sap.m.MessageToast.show("Post erfolgreich!");
                    },
                    error: function (oError) {
                        console.log(oError);
                        sap.m.MessageToast.show("Post fehlgeschlagen!");
                    }
                });
            },

            onReject : function () {
                var oModel = this.getOwnerComponent().getModel();
                var oModelPo = this.getView().getModel("selectedPurchaseOrder");
                var purchaseOrderId = oModelPo.getProperty("/oData/PurchaseOrder");

                // CSRF-Token abrufen
                var token = oModel.getSecurityToken();

                // Erstellen der URL für die POST-Anfrage
                var sUrl = "/sap/opu/odata/sap/ZOSO_PURCHASEORDER/reject";
                sUrl += "?sap-client=100";
                sUrl += "&PurchaseOrder='" + purchaseOrderId + "'";
                sUrl += "&x-csrf-token=" + token;

                // Festlegen der Header für die POST-Anfrage
                var oHeaders = {
                    "X-Requested-With": "XMLHttpRequest",
                    "x-csrf-token": token
                };

                $.ajax({
                    url: sUrl,
                    method: "POST",
                    headers: oHeaders,
                    success: function (oData, response) {
                        sap.m.MessageToast.show("Reject erfolgreich!");
                    },
                    error: function (oError) {
                        console.log(oError);
                        sap.m.MessageToast.show("Reject fehlgeschlagen!");
                    }
                });
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

            setPurchaseOrderCounts: function () {
                var oModel = this.getOwnerComponent().getModel("selectedPurchaseOrder");
                var oView = this.getView();
                var PurchaseOrderItemsLength = oModel.oData.oData.to_PurchaseOrderItem.results.length;
                var PurchaseOrderNotesLength = oModel.oData.oData.to_PurchaseOrderNote.results.length;
                oView.getModel("viewModel").setProperty("/PurchaseOrderItemCount", PurchaseOrderItemsLength);
                oView.getModel("viewModel").setProperty("/PurchaseOrderNoteCount", PurchaseOrderNotesLength);

            },

            onPurchaseOrderItemPressed: function (oEvent){
                var oSelectedItem = oEvent.getSource().getBindingContext("purchaseOrderItems").getObject();
                console.log(oSelectedItem);
                var oSelectedItemModel = new JSONModel(oSelectedItem);
                this.getView().setModel(oSelectedItemModel, "selectedPurchaseOrderItem");
                this.getSplitAppObj().to(this.createId("purchaseOrderItemDetail"));
                console.log("Selected Item Model:", oSelectedItemModel.getData());
            },

            onPressNavBack: function(oEvent) {
                this.getSplitAppObj().backDetail();
            },

            onPressNavNext: function(oEvent) {
                var oViewModel = this.getView().getModel("viewModel");
                var currentIndex = oViewModel.getProperty("/currentItemIndex");
                var itemCount = oViewModel.getProperty("/PurchaseOrderItemCount");
                if (currentIndex < itemCount - 1) {
                    currentIndex++;
                    this.updateSelectedPurchaseOrderItem(currentIndex);
                    oViewModel.setProperty("/currentItemIndex", currentIndex);
                }
            },

            onPressNavPrevious: function(oEvent) {
                var oViewModel = this.getView().getModel("viewModel");
                var currentIndex = oViewModel.getProperty("/currentItemIndex");
                if (currentIndex > 0) {
                    currentIndex--;
                    this.updateSelectedPurchaseOrderItem(currentIndex);
                    oViewModel.setProperty("/currentItemIndex", currentIndex);
                }
            },

            updateSelectedPurchaseOrderItem: function(index) {
                var oFormattedItems = this.getView().getModel("purchaseOrderItems").getData();
                var selectedItem = oFormattedItems[index];
                var jsonModel = new JSONModel(selectedItem);
                this.getView().setModel(jsonModel, "selectedPurchaseOrderItem");
            },

            getSplitAppObj: function () {
                var result = this.byId("SplitAppDemo");
                if (!result) {
                    Log.info("SplitApp object can't be found");
                }
                return result;
            }
        });
    });
