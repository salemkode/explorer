// Global component types for the manually registered components
// (src/plugins/components.ts). Names follow the conventions Nuxt used so
// templates keep type-checking the same way.
declare module "vue" {
	interface GlobalComponents {
		AddressDisplaySettingsDialog: typeof import("~/components/AddressDisplaySettingsDialog.vue")["default"];
		BaseCopy: typeof import("~/components/BaseCopy.vue")["default"];
		BaseHeader: typeof import("~/components/BaseHeader.vue")["default"];
		BasePagination: typeof import("~/components/BasePagination.vue")["default"];
		BlockCapacity: typeof import("~/components/BlockCapacity.vue")["default"];
		ContentWarp: typeof import("~/components/ContentWarp.vue")["default"];
		DarkSwitch: typeof import("~/components/DarkSwitch.vue")["default"];
		DropDown: typeof import("~/components/DropDown.vue")["default"];
		Footer: typeof import("~/components/Footer.vue")["default"];
		Image: typeof import("~/components/Image.vue")["default"];
		LoadingSpinner: typeof import("~/components/LoadingSpinner.vue")["default"];
		LoadingView: typeof import("~/components/LoadingView.vue")["default"];
		NavPills: typeof import("~/components/NavPills.vue")["default"];
		PopOver: typeof import("~/components/PopOver.vue")["default"];
		Progress: typeof import("~/components/Progress.vue")["default"];
		SliderUpDown: typeof import("~/components/SliderUpDown.vue")["default"];
		SortableList: typeof import("~/components/SortableList.vue")["default"];
		VTabs: typeof import("~/components/VTabs.vue")["default"];
		VueQrCode: typeof import("~/components/VueQrCode.vue")["default"];
		AddressHeader: typeof import("~/components/address/AddressHeader.vue")["default"];
		AddressNFTs: typeof import("~/components/address/AddressNFTs.vue")["default"];
		AddressTokens: typeof import("~/components/address/AddressTokens.vue")["default"];
		AddressTransaction: typeof import("~/components/address/AddressTransaction.vue")["default"];
		BcmrIcon: typeof import("~/components/bcmr/Icon.vue")["default"];
		BcmrInfo: typeof import("~/components/bcmr/Info.vue")["default"];
		BlockHeader: typeof import("~/components/block/BlockHeader.vue")["default"];
		BlockTransaction: typeof import("~/components/block/BlockTransaction.vue")["default"];
		HomeBlocksList: typeof import("~/components/home/BlocksList.vue")["default"];
		HomeHero: typeof import("~/components/home/HomeHero.vue")["default"];
		HomeUnconfirmedTransaction: typeof import("~/components/home/UnconfirmedTransaction.vue")["default"];
		NavSearch: typeof import("~/components/nav/search.vue")["default"];
		RegistersAddCard: typeof import("~/components/registers/RegistersAddCard.vue")["default"];
		RegistersItem: typeof import("~/components/registers/RegistersItem.vue")["default"];
		RegistersList: typeof import("~/components/registers/RegistersList.vue")["default"];
		TableCell: typeof import("~/components/table/Cell.vue")["default"];
		TableView: typeof import("~/components/table/View.vue")["default"];
		TokenAddress: typeof import("~/components/token/Address.vue")["default"];
		TokenChild: typeof import("~/components/token/Child.vue")["default"];
		TokenId: typeof import("~/components/token/TokenId.vue")["default"];
		TokenProvider: typeof import("~/components/token/Provider.vue")["default"];
		TokenTransaction: typeof import("~/components/token/Transaction.vue")["default"];
		TransactionList: typeof import("~/components/Transaction/TransactionList.vue")["default"];
		TransactionListOperation: typeof import("~/components/Transaction/TransactionListOperation.vue")["default"];
		TransactionOperationToken: typeof import("~/components/Transaction/TransactionOperationToken.vue")["default"];
		TxConfirm: typeof import("~/components/tx/Confirm.vue")["default"];
		LazyDarkSwitch: typeof import("~/components/DarkSwitch.vue")["default"];
	}
}

export {};
