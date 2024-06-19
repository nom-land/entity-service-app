import { http, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
    chains: [mainnet],
    connectors: [
        injected(),
        // coinbaseWallet({ appName: 'Create Wagmi' }),
        // walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID }),
    ],
    ssr: true,
    transports: {
        [mainnet.id]: http(),
    },
});

declare module "wagmi" {
    interface Register {
        config: typeof config;
    }
}
