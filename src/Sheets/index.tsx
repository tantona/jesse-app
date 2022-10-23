import { registerSheet } from "react-native-actions-sheet";
import { AddParts } from "./AddParts";
import { CreateReceipt } from "./CreateReceipt";
import { CreatePriceSheet } from "./CreatePriceSheet";
import { GetSignature } from "./GetSignature";
import { PickCustomer } from "./PickCustomer";

registerSheet("add-parts", AddParts, "create-receipt");
registerSheet("pick-customer", PickCustomer, "create-receipt");
registerSheet("pick-customer", PickCustomer);
registerSheet("create-receipt", CreateReceipt);
registerSheet("create-price-sheet", CreatePriceSheet);
registerSheet("get-signature", GetSignature);

export {};
