chrome.storage.local.get(["outputMode", "vaultFolder"], (config) => {
  const vaultFolder = config.vaultFolder || "Amazon/";

  function encodeMarkdownForURI(content) {
    return encodeURIComponent(content).replace(/'/g, "%27").replace(/"/g, "%22");
  }

  function sanitize(str) {
    return str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  function extractAmazonInfo() {
    const canonicalUrl = document.querySelector("link[rel='canonical']")?.href || window.location.href;
    const asinMatch = canonicalUrl.match(/\/dp\/([A-Z0-9]{10})/);
    const asin = asinMatch ? asinMatch[1] : "ASIN_NON_TROUVE";

    const title = document.getElementById("productTitle")?.innerText.trim() || "Titre introuvable";

    // Recherche du prix dans plusieurs sélecteurs connus
    const price = document.querySelector("#priceblock_ourprice")?.innerText.trim()
              || document.querySelector("#priceblock_dealprice")?.innerText.trim()
              || document.querySelector(".a-price .a-offscreen")?.innerText.trim()
              || "Prix non trouvé";

    const brandElement = document.querySelector("#bylineInfo");
    const brand = brandElement?.innerText || "Marque non trouvée";
    const brandUrl = brandElement?.href || "Lien marque non trouvé";

    const categoryArr = Array.from(document.querySelectorAll("#seo-breadcrumb-desktop-card_DetailPage_6 a"));
    const category = categoryArr.map(el => el.innerText.trim()).join(" > ") || "Uncategorized";
    const categorySlug = sanitize(category.split(">")[0] || "uncategorized");

    const landingImage = document.getElementById("landingImage")?.src;
    const imageMarkdown = landingImage ? `![image](${landingImage})` : "Image principale non trouvée";

    const bullets = Array.from(document.querySelectorAll("#feature-bullets ul li span"))
                        .map(el => `- ${el.innerText.trim()}`).join("\n");

    const description = document.querySelector("#productDescription")?.innerText.trim()
                        || document.querySelector("#bookDescription_feature_div")?.innerText.trim()
                        || "Description non trouvée";

    const variations = Array.from(document.querySelectorAll("#twister .a-button-selected span.a-button-text"))
                            .map(el => el.innerText.trim()).join(", ") || "Aucune déclinaison";

    const keywords = Array.from(document.querySelectorAll("meta[name='keywords']"))
                          .map(m => m.content).join(", ");

    const reviewCount = document.getElementById("acrCustomerReviewText")?.innerText.trim() || "Nombre d'avis non trouvé";
    const rating = document.querySelector("i[data-asin-rating] span")?.innerText.trim()
                 || document.querySelector("span.a-icon-alt")?.innerText.trim()
                 || "Note non trouvée";

    const properties = [
      "---",
      `title: ${title}`,
      `asin: ${asin}`,
      `price: ${price}`,
      `brand: ${brand}`,
      `brand_url: ${brandUrl}`,
      `category: ${category}`,
      `keywords: ${keywords}`,
      `rating: ${rating}`,
      `review_count: ${reviewCount}`,
      `variations: ${variations}`,
      `amazon_url: ${canonicalUrl}`,
      `image: ${landingImage || ''}`,
      "---"
    ].join("\n");

    const markdown = [
      properties,
      "",
      `## 🛍️ ${title}`,
      "",
      `**Marque :** [${brand}](${brandUrl})`,
      `**Catégorie :** ${category}`,
      `**Déclinaisons :** ${variations}`,
      `**Prix :** ${price}`,
      `**ASIN :** ${asin}`,
      `**Note moyenne :** ${rating}`,
      `**Nombre d'avis :** ${reviewCount}`,
      `**URL :** [Voir sur Amazon](${canonicalUrl})`,
      "",
      `### 📸 Image principale`,
      imageMarkdown,
      "",
      `### 📌 Points clés`,
      bullets || "Aucun bullet point trouvé",
      "",
      `### 📝 Description`,
      description
    ].join("\n");

    const firstWords = sanitize(title).split("_").slice(0, 4).join("_");
    const filename = `${asin}_${firstWords}.md`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    chrome.runtime.sendMessage({ action: "download", url: url, filename: filename });
  }

  extractAmazonInfo();
});
