export function supermarketSearchUrls(ingredientName: string): Record<string, string> {
  const q = encodeURIComponent(ingredientName)
  return {
    tesco: `https://www.tesco.ie/groceries/en-IE/search?query=${q}`,
    supervalu: `https://shop.supervalu.ie/results?q=${q}`,
    dunnes: `https://www.dunnesstoresgrocery.com/sm/delivery/rsid/258/results?q=${q}`,
    aldi: `https://www.aldi.ie/results?q=${q}`,
    lidl: `https://www.lidl.ie/q/search?q=${q}`,
  }
}
