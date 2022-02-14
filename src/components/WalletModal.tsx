import React, { useState } from "react";
import {
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Text,
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core";
import WalletConnect from "@walletconnect/web3-provider";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";

type Props = {
    isOpen: any;
    onClose: any;
};

export default function WalletModal({ isOpen, onClose }: Props) {
    const connectWC = () => {
        const wcProvider = new WalletConnect({
            infuraId: "8b4d9b4306294d2e92e0775ff1075066"
        });

        // wcProvider.wc.connected may be true if last connection state is in localStorage
        console.log("session", wcProvider.wc.session);

        return new Promise(async (resolve, reject) => {
            // uncomment to *fix*
            // await delay(1000);

            // // wcProvider.wc.connected would be false if the session was stale
            // console.log("session", wcProvider.wc.session);

            // connection refused in wallet
            wcProvider.wc.on("disconnect", () => {
                console.log("Disconnected");
                WalletConnectQRCodeModal.close();
                reject(new Error("Connection refused"));
            });

            // catch WC modal closure
            await wcProvider.enable().catch(reject);

            // if everything worked
            resolve(wcProvider);
        });
    };

    const WCConnector = ({ connect }: { connect: any }) => {
        const [clientV, setClientV] = useState(null);
        const [provider, setProvider] = useState(null);
        const [error, setError] = useState(null);
        const setupWC = async () => {
            try {
                const provider = await connect();

                setProvider(provider);
                setError(null);

                provider.send(
                    {
                        method: "web3_clientVersion"
                    },
                    ({ e, result }: { e: any, result: any }) => {
                        if (e) setError(e);
                        else {
                            setClientV(result);
                        }
                    }
                );

                provider.once("stop", () => {
                    setProvider(null);
                    setClientV(null);
                    setError(null);
                });

                // some web3 setup or whatever
            } catch (error) {
                console.log("Error connecting WC", error);
                setError(error as any);
            }
        };

        return (
            <div>
                {provider ? (
                    <Button colorScheme='blue' width='-webkit-fill-available' mt='5px'>Disconnect WC</Button>
                ) : (
                    <Button onClick={setupWC} colorScheme='blue' width='-webkit-fill-available' mt='5px'>Connect WC</Button>
                )}
            </div>
        );
    };
    const { account, deactivate, activateBrowserWallet } = useEthers();

    function handleConnectWallet() {
        activateBrowserWallet();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay />
            <ModalContent
                background="gray.900"
                border="1px"
                borderStyle="solid"
                borderColor="gray.700"
                borderRadius="3xl"
            >
                <ModalHeader color="white" px={4} fontSize="lg" fontWeight="medium">
                    Account
                </ModalHeader>
                <ModalCloseButton
                    color="white"
                    fontSize="sm"
                    _hover={{
                        color: "whiteAlpha.700",
                    }}
                />
                <ModalBody pt={0} px={4}>
                    <Box
                        borderRadius="3xl"
                        border="1px"
                        borderStyle="solid"
                        borderColor="gray.600"
                        px={5}
                        pt={5}
                        pb={5}
                        mb={3}
                    >
                        <Button colorScheme='blue' width='-webkit-fill-available' onClick={handleConnectWallet}>Metamask</Button>

                        <WCConnector
                            connect={connectWC}
                        />
                    </Box>
                </ModalBody>

                <ModalFooter
                    justifyContent="end"
                    background="gray.700"
                    borderBottomLeftRadius="3xl"
                    borderBottomRightRadius="3xl"
                    p={6}
                >
                    <Text
                        color="white"
                        textAlign="left"
                        fontWeight="medium"
                        fontSize="md"
                    >
                        Select Wallet
                    </Text>
                </ModalFooter>
            </ModalContent>
        </Modal >
    );
}
