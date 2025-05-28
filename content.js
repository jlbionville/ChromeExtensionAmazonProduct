
chrome.storage.local.get(["outputMode", "vaultFolder"], (config) => {
  const outputMode = config.outputMode || "clipboard";
  const vaultFolder = config.vaultFolder || "Amazon/";

  function encodeMarkdownForURI(content) {
    return encodeURIComponent(content).replace(/'/g, "%27").replace(/"/g, "%22");
  }

  function extractAmazonInfo() {
    const canonicalUrl = document.querySelector("link[rel='canonical']")?.href || window.location.href;
    const asinMatch = canonicalUrl.match(/\/dp\/([A-Z0-9]{10})/);
    const asin = asinMatch ? asinMatch[1] : "ASIN non trouvé";

    const title = document.getElementById("productTitle")?.innerText.trim() || "Titre introuvable";
    const price = document.querySelector("[data-asin-price]")?.getAttribute("data-asin-price")
                || document.querySelector("[data-display-price]")?.getAttribute("data-display-price")
                || "Prix non trouvé";

    const brandElement = document.querySelector("#bylineInfo");
    const brand = brandElement?.innerText || "Marque non trouvée";
    const brandUrl = brandElement?.href || "Lien marque non trouvé";

    const category = Array.from(document.querySelectorAll("#seo-breadcrumb-desktop-card_DetailPage_6 a"))
                          .map(el => `[${el.innerText.trim()}](${el.href})`).join(" > ") || "Catégorie non trouvée";

    const landingImage = document.getElementById("landingImage")?.src;
    const imageMarkdown = landingImage ? `![image](${landingImage})` : "Image principale non trouvée";

    const bullets = Array.from(document.querySelectorAll("#feature-bullets ul li span"))
                        .map(el => `- ${el.innerText.trim()}`).join("\n");

    const description = document.querySelector("#productDescription")?.innerText.trim()
                        || document.querySelector("#bookDescription_feature_div")?.innerText.trim()
                        || "Description non trouvée";

    const variations = Array.from(document.querySelectorAll("#twister .a-button-selected span.a-button-text"))
                            .map(el => el.innerText.trim()).join(", ") || "Aucune déclinaison";

    const tags = ["#amazon", `#${brand.toLowerCase().replace(/\s+/g, "_")}`, ...category.split(">").map(cat => `#${cat.replace(/\[|\]\(.+?\)/g, '').trim().toLowerCase().replace(/\s+/g, "_")}`)];

    const properties = [
      "---",
      `title: ${title}`,
      `asin: ${asin}`,
      `price: ${price}`,
      `brand: ${brand}`,
      `brand_url: ${brandUrl}`,
      `category: ${category}`,
      `tags: [${tags.join(", ")}]`,
      `variations: ${variations}`,
      `amazon_url: ${canonicalUrl}`,
      `image: ${landingImage || ''}`,
      "---"
    ].join("\n");

    const markdown = [
      properties,
      ``,
      `## 🛍️ ${title}`,
      ``,
      `**Marque :** [${brand}](${brandUrl})`,
      `**Catégorie :** ${category}`,
      `**Déclinaisons :** ${variations}`,
      `**Prix :** ${price}`,
      `**ASIN :** ${asin}`,
      `**URL :** [Voir sur Amazon](${canonicalUrl})`,
      ``,
      `### 📸 Image principale`,
      imageMarkdown,
      ``,
      `### 📌 Points clés`,
      bullets || "Aucun bullet point trouvé",
      ``,
      `### 📝 Description`,
      description
    ].join("\n");

    const filename = `${title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.md`;

    if (outputMode === "clipboard") {
      navigator.clipboard.writeText(markdown).then(() => {
        alert("✅ Infos copiées dans le presse-papiers !");
      });
    } else if (outputMode === "markdown") {
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      chrome.runtime.sendMessage({ action: "download", url: url, filename: filename });
    } else if (outputMode === "obsidian-uri") {
      const uri = `obsidian://new?name=${encodeURIComponent(vaultFolder + filename.replace('.md',''))}&content=${encodeMarkdownForURI(markdown)}`;
      window.open(uri, "_blank");
    }
  }

  extractAmazonInfo();
});
