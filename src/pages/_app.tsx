import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import { Analytics } from "@vercel/analytics/react";
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { NextIntlProvider } from "next-intl";
import { DefaultSeo } from "next-seo";

import type { ColorScheme } from "@mantine/core";
import type { AbstractIntlMessages } from "next-intl";

import { CustomFonts } from "src/styles/CustomFonts";
import { getMantineTheme } from "src/styles/theme";
import { api } from "src/utils/api";

const MyApp: AppType<{ messages?: AbstractIntlMessages | undefined; session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    const preferredColorScheme = useColorScheme();

    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        defaultValue: preferredColorScheme,
        getInitialValueInEffect: true,
        key: "mantine-color-scheme",
    });

    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

    return (
        <>
            <DefaultSeo
                // todo add i18n
                additionalMetaTags={[
                    { content: "minimum-scale=1, initial-scale=1, width=device-width", name: "viewport" },
                ]}
                // todo: remove below
                // description="A digital menu generator that lets you to create the best menu for your restaurant. Menufic is packed with several features that will boost the online presence of your restaurant with ease"
                openGraph={{
                    images: [{ url: "https://menufic.com/menufic_banner.jpg" }],
                    siteName: "menufic.com",
                    type: "website",
                    url: "https://menufic.com",
                }}
                themeColor="#c24152"
                titleTemplate="Menufic - %s"
                twitter={{ cardType: "summary_large_image" }}
            />
            <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
                <MantineProvider theme={getMantineTheme(colorScheme)} withGlobalStyles withNormalizeCSS>
                    <CustomFonts />
                    <NotificationsProvider>
                        <SessionProvider session={session}>
                            <NextIntlProvider messages={pageProps.messages}>
                                <Component {...pageProps} />
                            </NextIntlProvider>
                            <Analytics />
                        </SessionProvider>
                    </NotificationsProvider>
                </MantineProvider>
            </ColorSchemeProvider>
        </>
    );
};

export default api.withTRPC(MyApp);
