"use client";

import { useTranslationContext } from "@/contexts/TranslationContext";

// Variables
import { AUTHOR_GITHUB } from "@/lib/variables";

const BaseFooter = () => {
    const { _t } = useTranslationContext();

    return (
        <footer className="container py-10">
            <p>
                {_t("footer.developedBy")}{" "}
                <a
                    href="https://www.endao.vip"
                    target="_blank"
                    style={{ textDecoration: "underline" }}
                >
                    Inspirata Publishing (Hong Kong) Limited
                </a>
            </p>
        </footer>
    );
};

export default BaseFooter;
