import { currency, salesEndpoint, productsEndpoint } from "./constants.js";
import { receiptGenerator } from "./helpers.js";

const showSaleDialogBtn = document.querySelector("#show_sale_dialog_btn");
const saleDialog = document.querySelector("#sale_dialog");
const cancelSaleBtn = document.querySelector("#sale_dialog_cancel");
const productGrid = document.querySelector("#sale_product_grid");
const saleSearchInput = document.querySelector("#sale_search_input");
const saleCart = document.querySelector("#sale_cart");
const saleTotalPrice = document.querySelector("#sale_total_price");
const saleTotalProfit = document.querySelector("#sale_total_profit");
const createSaleBtn = document.querySelector("#sale_dialog_submit");
const salesTableBody = document.querySelector("#sales_table_body");
const salesTotalPrice = document.querySelector("#sales_total_price");
const salesTotalProfit = document.querySelector("#sales_total_profit");
const priceHeader = document.querySelector("#price_header");
const profitHeader = document.querySelector("#profit_header");
// we need to store products to search and restore after search
let fetchedProducts;
let cartProducts = [];

// Suffxing currency where necesssary
priceHeader.textContent = `${priceHeader.textContent}(${currency})`;
profitHeader.textContent = `${profitHeader.textContent}(${currency})`;

fetchProducts();
fetchTodaySales();

showSaleDialogBtn.addEventListener("click", () => {
    // clearing previously selected products
    saleCart.innerHTML = "";
    cartProducts = [];
    saleTotalPrice.textContent = currency + 0;
    saleTotalProfit.textContent = currency + 0;
    saleDialog.showModal();
});

cancelSaleBtn.addEventListener("click", () => {
    saleDialog.close();
});

// trigger everytime when user types in search bar
saleSearchInput.addEventListener("keyup", searchProducts);

createSaleBtn.addEventListener("click", createSale);

function searchProducts() {
    const input = saleSearchInput.value.toLowerCase();
    productGrid.innerHTML = "";
    if (input == "") {
        // display all product if search bar becomes empty
        displayProducts(fetchedProducts);
    } else {
        const searchedProducts = [];
        for (const product of fetchedProducts) {
            if (product.name.toLowerCase().includes(input)) {
                searchedProducts.push(product);
            }
        }
        displayProducts(searchedProducts);

    }
}

function fetchProducts() {
    fetch(productsEndpoint, {
        method: "GET"
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Fetching products failed");
        }
    }).then((products) => {
        fetchedProducts = products;
        displayProducts(products);
    }).catch((error) => {
        console.error(error);
    });
}

function displayProducts(products) {
    productGrid.innerHTML = "";
    for (const product of products) {
        const div = document.createElement("div");
        div.classList.add("sale_product_card");
        div.addEventListener("click", () => {
            // same product can't be added twice 
            if (!cartProducts.map((product) => product.id).includes(product._id)) {
                const newProduct = {
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    cost: product.cost,
                    quantity: 1,
                    stock: product.stock
                };
                appendCartProduct(newProduct);

            }
        });
        const name = document.createElement("span");
        name.classList.add("sale_product_name");
        name.textContent = product.name;
        const price = document.createElement("span");
        price.classList.add("sale_product_price");
        price.textContent = `${currency}${product.price}`;
        const stock = document.createElement("span");
        stock.classList.add("sale_product_stock");
        stock.textContent = `${product.stock} in stock`;
        div.appendChild(name);
        div.appendChild(price);
        div.appendChild(stock);
        productGrid.appendChild(div);
    }
}

function appendCartProduct(product) {
    if (product.stock == 0) {
        alert(`No stock available for ${product.name}`);
    } else {
        /* Structure of our element
           Element(div):
           itemInfo(div) having name(span), price(span)
           quantity(div) having upBtn, downBtn, quantity itself
           removeBtn
        */
        const div = document.createElement("div");
        // we need to store id in html element to fetch on update and only update that element
        div.id = product.id;
        div.classList.add("sale_cart_item");
        const itemInfo = document.createElement("div");
        itemInfo.classList.add("sale_cart_item_info");
        const name = document.createElement("span");
        name.classList.add("sale_cart_item_name");
        name.textContent = product.name;
        const price = document.createElement("span");
        price.classList.add("sale_cart_item_meta");
        price.textContent = `Price: Rs.${product.price}`;
        itemInfo.appendChild(name);
        itemInfo.appendChild(price);
        const quantityDiv = document.createElement("div");
        quantityDiv.classList.add("sale_cart_item_controls");
        const downBtn = document.createElement("button");
        const quantity = document.createElement("span");
        quantity.classList.add("sale_qty_value");
        quantity.textContent = product.quantity;
        downBtn.classList.add("sale_qty_btn",);
        downBtn.classList.add("sale_qty_down");
        downBtn.textContent = "-";
        downBtn.addEventListener("click", () => {
            const pro = cartProducts.find((p) => p.id == product.id);
            // quantity below one is meaningless
            if (pro.quantity > 1) {
                pro.quantity -= 1;
                quantity.textContent = parseInt(quantity.textContent) - 1;
                updateTotalPrice();
            }
        });
        const upBtn = document.createElement("button");
        upBtn.classList.add("sale_qty_btn");
        upBtn.classList.add("sale_qty_up");
        upBtn.textContent = "+";
        upBtn.addEventListener("click", () => {
            const pro = cartProducts.find((p) => p.id == product.id);
            if (pro.quantity < product.stock) {
                pro.quantity += 1;
                quantity.textContent = parseInt(quantity.textContent) + 1;
                updateTotalPrice();
            } else {
                alert(`No more stock available for ${product.name}`);
            }

        });

        quantityDiv.appendChild(downBtn);
        quantityDiv.appendChild(quantity);
        quantityDiv.appendChild(upBtn);
        const removebutton = document.createElement("button");
        removebutton.classList.add("sale_cart_remove");
        removebutton.addEventListener("click", () => {
            // filtering all other elements than the current one
            cartProducts = cartProducts.filter((p) => p.id != product.id);
            div.remove();
            updateTotalPrice();
        });
        removebutton.textContent = "x";
        div.appendChild(itemInfo);
        div.appendChild(quantityDiv);
        div.appendChild(removebutton);
        saleCart.appendChild(div);
        cartProducts.push(
            product
        );
        updateTotalPrice();
    }
}

// price & profit has to be updated on addition or removal of product & inc or dec of quantity
function updateTotalPrice() {
    let totalPrice = 0;
    let totalProfit = 0;
    for (const product of cartProducts) {
        totalPrice += product.quantity * product.price;
        const profit = product.price - product.cost;
        totalProfit += product.quantity * profit;
    }
    saleTotalPrice.textContent = currency + totalPrice;
    saleTotalProfit.textContent = currency + totalProfit;
}

function createSale() {
    if (cartProducts.length != 0) {
        // prodcuts required structure: [{"id": "", "quantity": "", "name": ""}, ...]
        const products = [];
        for (const product of cartProducts) {
            products.push({ id: product.id, quantity: product.quantity, name: product.name, price: product.price, profit: product.price - product.cost });
        }
        fetch(salesEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    products: products
                }
            )
        }).then((response) => {
            if (response.ok) {
                // sales & products have changed
                fetchTodaySales();
                fetchProducts();
                saleDialog.close();
            } else {
                throw new Error("Sale creation failed");
            }
        }).catch((error) => {
            console.log(error);
        });
    }
}

function fetchTodaySales() {
    const now = new Date();
    const endpoint = `${salesEndpoint}?year=${now.getFullYear()}&month=${now.getMonth() + 1}&day=${now.getDate()}`;
    fetch(endpoint, { method: "GET" }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            console.log("Sales fetch failed");
        }
    }).then((json) => {
        /*
          Reponse structure:
          { 
            sales: [{_id: , products: , price: , profit: , time: }], 
            summary: {totalSales: , totalProfit: }
          }
        */
        salesTableBody.innerHTML = "";
        for (const sale of json.sales) {
            /* Structure of tr element:
              Five tds for Id, Time, Products, Price, Profit
            */
            const tr = document.createElement("tr");
            const id = document.createElement("td");
            id.textContent = sale._id.slice(sale._id.length - 5);
            const time = document.createElement("td");
            // sale has time in string, we convert to date object, then to (hour:min AM/PM format)
            const createdAt = new Date(sale.createdAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });;
            time.textContent = createdAt;
            const products = document.createElement("td");
            let productsText = "";
            for (const product of sale.products) {
                productsText += `${product.name}(${product.quantity}) \t`;
            }
            products.textContent = productsText;
            const price = document.createElement("td");
            price.textContent = sale.price;
            const profit = document.createElement("td");
            profit.textContent = sale.profit;
            const receipt = document.createElement("button");
            receipt.textContent = "Receipt";
            receipt.classList.add("btn_receipt");
            receipt.addEventListener("click", () => {receiptGenerator(sale)});
            tr.appendChild(id);
            tr.appendChild(time)
            tr.appendChild(products);
            tr.appendChild(price);
            tr.appendChild(profit);
            tr.appendChild(receipt);
            salesTableBody.appendChild(tr);
        }
        salesTotalPrice.textContent = json.summary.totalPrice;
        salesTotalProfit.textContent = json.summary.totalProfit;
    }).catch((error) => {
        console.log(error);
    });

}


