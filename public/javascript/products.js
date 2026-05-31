const showProductDialogBtn = document.querySelector("#show_product_dialog_btn");
const productDialog = document.querySelector("#product_dialog");
const productDialogTitle = document.querySelector("#product_dialog_title");
const cancelProductBtn = document.querySelector("#product_dialog_cancel");
const createEditProductBtn = document.querySelector("#product_dialog_create_edit");
const productName = document.querySelector("#product_name");
const productPrice = document.querySelector("#product_price");
const productCost = document.querySelector("#product_cost");
const productStock = document.querySelector("#product_stock");
const productForm = document.querySelector("#create_product_form");
const productTableBody = document.querySelector("#product_table_body");
const baseUrl = "http://localhost:8000";
const url = `${baseUrl}/api/products`;
let isEditing = false;
let currentProductId;

fetchProducts();


showProductDialogBtn.addEventListener("click", showCreateProductDialog);

cancelProductBtn.addEventListener("click", () => {
    productDialog.close();
});

productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (isEditing) {
        editProduct();
    } else {
        createProduct();
    }
});

// product dialog and it's button have to be used for both
// creating and editing products
// we update title, btn text and event listener everytime before usage
function showCreateProductDialog() {
    isEditing = false;
    productDialog.close();
    // removing any data from uncompleted editing
    productName.value = "";
    productPrice.value = "";
    productCost.value = "";
    productStock.value = "";
    productDialogTitle.textContent = "Add product";
    createEditProductBtn.textContent = "Create";
    productDialog.showModal();
}


function fetchProducts() {
    fetch(url, {
        method: "GET"
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Fetching products failed");
        }
    }).then((products) => {
        productTableBody.innerHTML = "";
        for (const product of products) {
            const tr = document.createElement("tr");
            const id = document.createElement("td");
            // showing only last four elements of id
            id.textContent = product._id.slice(product._id.length - 5);
            const name = document.createElement("td");
            name.textContent = product.name;
            const price = document.createElement("td");
            price.textContent = product.price;
            const cost = document.createElement("td");
            cost.textContent = product.cost;
            const stock = document.createElement("td");
            stock.textContent = product.stock;
            const buttons = document.createElement("td");
            const buttonsDiv = document.createElement("div");
            buttons.classList.add("action_buttons");
            const editButton = document.createElement("button");
            editButton.classList.add("btn_edit");
            editButton.addEventListener("click", (event) => {
                event.preventDefault();
                showEditProductDialog(product)
            });
            editButton.textContent = "Edit";
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("btn_delete");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => { deleteProduct(product._id) });
            buttonsDiv.appendChild(deleteButton);
            buttonsDiv.appendChild(editButton);
            buttons.appendChild(buttonsDiv);
            tr.appendChild(id);
            tr.appendChild(name);
            tr.appendChild(price);
            tr.appendChild(cost);
            tr.appendChild(stock);
            tr.appendChild(buttons);
            productTableBody.appendChild(tr);
        }
    }).catch((error) => {
        console.error(error);
    });
}

function deleteProduct(id) {
    // confirming if user really wants to delete
    if (confirm("Do you want to delete this product?")) {
        fetch(`${url}/${id}`, {
            method: "DELETE"
        }).then((response) => {
            if (response.ok) {
                fetchProducts();
            } else {
                throw new Error("Product deletion failed");
            }
        }).catch((error) => {
            console.error(error);
        });
    }
}

function createProduct() {
    const name = productName.value;
    const price = parseFloat(productPrice.value);
    const cost = parseFloat(productCost.value);
    const stock = parseInt(productStock.value);

    // cost can't be greater than price
    if (cost > price) {
        alert("Cost of product can't be greater than price!");
    } else {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    name: name,
                    price: price,
                    cost: cost,
                    stock: stock
                }
            )
        }).then((response) => {
            if (response.ok) {
                // products have changed so fetching again
                fetchProducts();
                productDialog.close();
            } else {
                throw new Error("Product creation failed");
            }
        }).catch((error) => {
            console.error(error);
        });
    }
}

function showEditProductDialog(product) {
    isEditing = true;
    // setting dialog for editing
    productDialogTitle.textContent = "Edit product";
    createEditProductBtn.textContent = "Edit";
    // adding the existing value of properties of product
    currentProductId = product._id;
    productName.value = product.name;
    productPrice.value = product.price;
    productCost.value = product.cost;
    productStock.value = product.stock;
    productDialog.showModal();
}

function editProduct() {
    const name = productName.value;
    const price = parseFloat(productPrice.value);
    const cost = parseFloat(productCost.value);
    const stock = parseInt(productStock.value);
    if (cost > price) {
        alert("Cost of product can't be greater than price!");
    } else {
        fetch(`${url}/${currentProductId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body:
                JSON.stringify(
                    {
                        name: name,
                        price: price,
                        cost: cost,
                        stock: stock
                    }
                )

        }).then((response) => {
            if (response.ok) {
                fetchProducts();
                productDialog.close();
            } else {
                throw new Error("Product updation failed");
            }
        }).catch((error) => {
            console.error(error);
        });
    }
}




