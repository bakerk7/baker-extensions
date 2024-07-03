// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").CartOperation} CartOperation
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const serviceFeeVariantId = "gid://shopify/ProductVariant/48211558203414";
  console.log(input.cart.lines);
  
  // Calculate the cart total
  const cartTotal = input.cart.lines.reduce((total, cartLine) => {
    return total + parseFloat(cartLine.cost.totalAmount.amount);
  }, 0);

  console.log(`Cart Total: ${cartTotal}`);

  // Calculate the new Service Fee price as 10% of the cart total
  const newServiceFeePrice = (cartTotal * 0.10).toFixed(2);

  console.log(`New Service Fee Price: ${newServiceFeePrice}`);

  // Find the Service Fee Product and update its price
  const operations = input.cart.lines.reduce(
    /** @param {CartOperation[]} acc */
    (acc, cartLine) => {
      const updateOperation = optionallyBuildUpdateOperation(cartLine, newServiceFeePrice, serviceFeeVariantId);

      if (updateOperation) {
        console.log(`Update Operation: ${JSON.stringify(updateOperation)}`);
        return [...acc, { update: updateOperation }];
      }

      return acc;
    },
    []
  );

  console.log(`Operations: ${JSON.stringify(operations)}`);
  return operations.length > 0 ? { operations } : NO_CHANGES;
}

/**
 * @param {RunInput['cart']['lines'][number]} cartLine
 * @param {string} newServiceFeePrice
 * @param {string} serviceFeeVariantId
 */
function optionallyBuildUpdateOperation(cartLine, newServiceFeePrice, serviceFeeVariantId) {
  const { id: cartLineId, merchandise, cost } = cartLine;

  console.log(`Checking cart line: ${cartLineId}`);
  console.log(`Variant ID: ${merchandise.id}`);
  console.log(`Product type: ${merchandise.__typename}`);

  // Check if merchandise is a ProductVariant and has the correct variant ID
  if (merchandise.__typename === "ProductVariant" && merchandise.id === serviceFeeVariantId) {
    console.log(`Found Service Fee Product: ${cartLineId}`);
    return {
      cartLineId,
      price: {
        adjustment: {
          fixedPricePerUnit: {
            amount: newServiceFeePrice,
          },
        },
      },
    };
  }

  return null;
}