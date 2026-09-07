import type { App } from "vue";
import { defineAsyncComponent } from "vue";

// Explicit registration replacing Nuxt's auto-imported components.
// Names follow the conventions Nuxt used (directory prefix + file name,
// with duplicate segments collapsed), so templates keep working as-is.
import AddressDisplaySettingsDialog from "~/components/AddressDisplaySettingsDialog.vue";
import AddressHeader from "~/components/address/AddressHeader.vue";
import AddressNFTs from "~/components/address/AddressNFTs.vue";
import AddressTokens from "~/components/address/AddressTokens.vue";
import AddressTransaction from "~/components/address/AddressTransaction.vue";
import BaseCopy from "~/components/BaseCopy.vue";
import BaseHeader from "~/components/BaseHeader.vue";
import BasePagination from "~/components/BasePagination.vue";
import BlockCapacity from "~/components/BlockCapacity.vue";
import BcmrIcon from "~/components/bcmr/Icon.vue";
import BcmrInfo from "~/components/bcmr/Info.vue";
import BlockHeader from "~/components/block/BlockHeader.vue";
import BlockTransaction from "~/components/block/BlockTransaction.vue";
import ContentWarp from "~/components/ContentWarp.vue";
import DropDown from "~/components/DropDown.vue";
import Footer from "~/components/Footer.vue";
import HomeBlocksList from "~/components/home/BlocksList.vue";
import HomeHero from "~/components/home/HomeHero.vue";
import HomeUnconfirmedTransaction from "~/components/home/UnconfirmedTransaction.vue";
import Image from "~/components/Image.vue";
import LoadingSpinner from "~/components/LoadingSpinner.vue";
import LoadingView from "~/components/LoadingView.vue";
import NavPills from "~/components/NavPills.vue";
import NavSearch from "~/components/nav/search.vue";
import PopOver from "~/components/PopOver.vue";
import Progress from "~/components/Progress.vue";
import RegistersAddCard from "~/components/registers/RegistersAddCard.vue";
import RegistersItem from "~/components/registers/RegistersItem.vue";
import RegistersList from "~/components/registers/RegistersList.vue";
import SliderUpDown from "~/components/SliderUpDown.vue";
import SortableList from "~/components/SortableList.vue";
import TransactionList from "~/components/Transaction/TransactionList.vue";
import TransactionListOperation from "~/components/Transaction/TransactionListOperation.vue";
import TransactionOperationToken from "~/components/Transaction/TransactionOperationToken.vue";
import TableCell from "~/components/table/Cell.vue";
import TableView from "~/components/table/View.vue";
import TokenAddress from "~/components/token/Address.vue";
import TokenChild from "~/components/token/Child.vue";
import TokenProvider from "~/components/token/Provider.vue";
import TokenId from "~/components/token/TokenId.vue";
import TokenTransaction from "~/components/token/Transaction.vue";
import TxConfirm from "~/components/tx/Confirm.vue";
import VTabs from "~/components/VTabs.vue";
import VueQrCode from "~/components/VueQrCode.vue";

export const registerComponents = (app: App) => {
	const components: Record<string, unknown> = {
		AddressDisplaySettingsDialog,
		BaseCopy,
		BaseHeader,
		BasePagination,
		BlockCapacity,
		ContentWarp,
		DropDown,
		Footer,
		Image,
		LoadingSpinner,
		LoadingView,
		NavPills,
		PopOver,
		Progress,
		SliderUpDown,
		SortableList,
		VTabs,
		VueQrCode,
		AddressHeader,
		AddressNFTs,
		AddressTokens,
		AddressTransaction,
		BcmrIcon,
		BcmrInfo,
		BlockHeader,
		BlockTransaction,
		HomeBlocksList,
		HomeHero,
		HomeUnconfirmedTransaction,
		NavSearch,
		RegistersAddCard,
		RegistersItem,
		RegistersList,
		TableCell,
		TableView,
		TokenAddress,
		TokenChild,
		TokenId,
		TokenProvider,
		TokenTransaction,
		TransactionList,
		TransactionListOperation,
		TransactionOperationToken,
		TxConfirm,
		// "Lazy" components resolve to async imports, like in Nuxt
		LazyDarkSwitch: defineAsyncComponent(
			() => import("~/components/DarkSwitch.vue"),
		),
		DarkSwitch: defineAsyncComponent(
			() => import("~/components/DarkSwitch.vue"),
		),
	};

	for (const [name, component] of Object.entries(components)) {
		app.component(name, component as never);
	}
};
