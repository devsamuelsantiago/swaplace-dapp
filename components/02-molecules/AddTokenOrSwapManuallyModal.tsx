import { ForWhom } from "../03-organisms";
import { publicClient } from "@/lib/wallet/wallet-config";
import { SwapContext, SwapModalLayout } from "@/components/01-atoms";
import { useAuthenticatedUser } from "@/lib/client/hooks/useAuthenticatedUser";
import { MockERC20Abi, MockERC721Abi } from "@/lib/client/abi";
import { TokenType } from "@/lib/shared/types";
import React, { useContext, useState } from "react";
import cc from "classcat";
import { getContract, isAddress } from "viem";
import { useNetwork } from "wagmi";
import toast from "react-hot-toast";

export enum AddTokenOrSwapManuallyModalVariant {
  SWAP = "swap",
  TOKEN = "token",
}

interface AddManuallyConfig {
  header: string;
  body: React.ReactNode;
}

interface AddManuallyProps {
  variant?: AddTokenOrSwapManuallyModalVariant;
  forWhom: ForWhom;
  onClose: () => void;
  open: boolean;
}

const SwapBody = () => {
  return (
    <div className="flex flex-col gap-6 ">
      <div className="flex flex-col gap-2">
        <div className="dark:p-small-dark p-small-variant-black">Swap ID</div>
        <div>
          <input className="w-full p-3 dark:bg-[#282a29] border border-[#353836] rounded-lg h-[44px]" />
        </div>
      </div>
      <div className="flex h-[36px]">
        <button className="bg-[#DDF23D] hover:bg-[#aabe13] w-full dark:shadow-add-manually-button py-2 px-4 rounded-[10px] p-medium-bold-variant-black">
          Add Swap
        </button>
      </div>
    </div>
  );
};

interface TokenBodyProps {
  forWhom: ForWhom;
}

const TokenBody = ({ forWhom }: TokenBodyProps) => {
  const [tokenType, setTokenType] = useState<TokenType>(TokenType.ERC20);
  const [contractAddress, setContractAddress] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");
  // const {  data } = useWalletClient();

  const { chain } = useNetwork();
  const { authenticatedUserAddress } = useAuthenticatedUser();
  const { validatedAddressToSwap } = useContext(SwapContext);

  const addTokenCard = async () => {
    const address =
      forWhom === ForWhom.Your
        ? authenticatedUserAddress
        : validatedAddressToSwap;

    if (!address) {
      throw new Error("No valid address was given to add a token card for.");
    }

    if (!contractAddress) {
      throw new Error("No contract address was given to add a token card for.");
    } else if (isAddress(contractAddress) === false) {
      toast.error("Invalid contract address.");
      return;
    }

    if (!chain) {
      throw new Error("No chain was found.");
    }

    const [abi, functionName, args] =
      tokenType === TokenType.ERC20
        ? [MockERC20Abi, "balanceOf", [address]]
        : [MockERC721Abi, "ownerOf", [tokenId]];

    const newTokenContract = getContract({
      address: contractAddress,
      publicClient: publicClient({ chainId: chain.id }),
      abi,
    });
    // TODO: verify token ownership
    console.log(newTokenContract);
    try {
      const { request } = await publicClient({
        chainId: chain.id,
      }).simulateContract({
        account: address.address,
        address: contractAddress,
        args: args,
        functionName,
        abi,
      });

      console.log(request);
      // const transactionHash: Hash = await data.re;
      // const data = await publicClient.readContract(request)

      // onWalletConfirmation();
      // let txReceipt = {} as TransactionReceipt;
      // while (typeof txReceipt.blockHash === "undefined") {
      /*
          It is guaranteed that at some point we'll have a valid TransactionReceipt in here.
          If we had a valid transaction sent (which is confirmed at this point by the try/catch block),
          it is a matter of waiting the transaction to be mined in order to know whether it was successful or not.
          So why are we using a while loop here?
          - Because it is possible that the transaction was not yet mined by the time
          we reach this point. So we keep waiting until we have a valid TransactionReceipt.
        */
      //   const transactionReceipt = await publicClient({
      //     chainId,
      //   }).waitForTransactionReceipt({
      //     hash: transactionHash,
      //   });
      //   if (transactionReceipt) {
      //     txReceipt = transactionReceipt;
      //   }
      // }
      // return {
      //   success: true,
      //   receipt: txReceipt,
      //   errorMessage: null,
      // };
    } catch (error) {
      console.error(error);
      return {
        receipt: null,
        success: false,
        errorMessage: String(error),
      };
    }
  };

  return (
    <div className="flex flex-col gap-6 ">
      <div className="flex flex-col gap-2">
        <div className="">What kind of token you want to add?</div>
        <div className="flex justify-between gap-3 ">
          <button
            className={cc([
              "w-full border border-[#353836] rounded-lg py-3 pl-3 pr-4 text-start dark:bg-[#282B29]",
              tokenType === TokenType.ERC20
                ? "dark:bg-[#ddf23d] bg-[#ddf23d] p-medium-2"
                : "dark:p-medium-2-dark dark:hover:bg-[#353836] hover:bg-[#35383617]",
            ])}
            onClick={() => {
              setTokenType(TokenType.ERC20);
            }}
          >
            ERC20
          </button>
          <button
            className={cc([
              "w-full  border border-[#353836] rounded-lg py-3 pl-3 pr-4 text-start dark:bg-[#282B29]",
              tokenType === TokenType.ERC721
                ? "dark:bg-[#ddf23d] bg-[#ddf23d] p-medium-2"
                : "dark:p-medium-2-dark dark:hover:bg-[#353836] hover:bg-[#35383617]",
            ])}
            onClick={() => {
              setTokenType(TokenType.ERC721);
            }}
          >
            ERC721
          </button>
        </div>
      </div>
      <div>
        {tokenType === TokenType.ERC20 ? (
          <div className="flex flex-col gap-2">
            <div className="dark:p-small-dark p-small-variant-black">
              Contract address
            </div>
            <div>
              <input className="w-full p-3 dark:bg-[#282a29] border border-[#353836] rounded-lg h-[44px]" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="dark:p-small-dark p-small-variant-black">
                Contract address
              </div>
              <div>
                <input
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="w-full p-3 dark:bg-[#282a29] border border-[#353836] rounded-lg h-[44px]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="dark:p-small-dark p-small-variant-black ">
                Token ID
              </div>
              <div>
                <input
                  onChange={(e) => setTokenId(e.target.value)}
                  className="w-full p-3 dark:bg-[#282a29] border border-[#353836] rounded-lg h-[44px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex h-[36px]">
        <button
          onClick={addTokenCard}
          className="bg-[#DDF23D] hover:bg-[#aabe13] w-full dark:shadow-add-manually-button py-2 px-4 rounded-[10px] p-medium-bold-variant-black"
        >
          Add token
        </button>
      </div>
    </div>
  );
};

const AddTokenOrSwapManuallyModalConfig = (
  variant: AddTokenOrSwapManuallyModalVariant,
  forWhom: ForWhom,
) => {
  const configs: Record<AddTokenOrSwapManuallyModalVariant, AddManuallyConfig> =
    {
      [AddTokenOrSwapManuallyModalVariant.SWAP]: {
        header: "Add swap manually",
        body: <SwapBody />,
      },
      [AddTokenOrSwapManuallyModalVariant.TOKEN]: {
        header: "Add token",
        body: <TokenBody forWhom={forWhom} />,
      },
    };

  return configs[variant] || <></>;
};

export const AddTokenOrSwapManuallyModal = ({
  variant = AddTokenOrSwapManuallyModalVariant.TOKEN,
  forWhom,
  onClose,
  open,
}: AddManuallyProps) => {
  const modalConfig = AddTokenOrSwapManuallyModalConfig(variant, forWhom);

  return (
    <SwapModalLayout
      toggleCloseButton={{ open, onClose }}
      body={modalConfig.body}
      text={{ title: modalConfig.header }}
    />
  );
};
