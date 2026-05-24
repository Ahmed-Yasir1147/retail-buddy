const showProductDialogBtn = document.querySelector("#show_product_dialog_btn");
const productDialog = document.querySelector("#product_dialog");
const cancelProductBtn = document.querySelector("#product_dialog_cancel");
const createProductBtn = document.querySelector("#product_dialog_create");
const productName = document.querySelector("#product_name");
const productPrice = document.querySelector("#product_price");
const productCost = document.querySelector("#product_cost");
const productQuantity = document.querySelector("#product_quantity");
const createProductForm = document.querySelector("#create_product_form");
const productTableBody = document.querySelector("#product_table_body");
const baseUrl = "http://localhost:8000";
const url = `${baseUrl}/api/products`;

fetchProducts();

showProductDialogBtn.addEventListener("click", () => {
    console.log(productDialog);
    productDialog.showModal();
});

cancelProductBtn.addEventListener("click", () => {
    productDialog.close();
});


createProductForm.addEventListener("submit", createProduct);

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
            const quantity = document.createElement("td");
            quantity.textContent = product.quantity;
            const buttons = document.createElement("td");
            const buttonsDiv = document.createElement("div");
            buttons.classList.add("action_buttons");
            const editButton = document.createElement("button");
            editButton.classList.add("btn_edit");
            editButton.textContent = "Edit";
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("btn_delete");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => {deleteProduct(product._id)});
            buttonsDiv.appendChild(deleteButton);
            buttonsDiv.appendChild(editButton);
            buttons.appendChild(buttonsDiv);
            tr.appendChild(id);
            tr.appendChild(name);
            tr.appendChild(price);
            tr.appendChild(cost);
            tr.appendChild(quantity);
            tr.appendChild(buttons);
            productTableBody.appendChild(tr);
        }
    }).catch((error) => {
        console.error(error);
    });
}

function deleteProduct(id) {
    fetch(`${url}/${id}`, {
        method: "DELETE"
    }).then((response) => {
        console.log(response);
        if (response.ok) {
            console.log("Deletion successful");
            fetchProducts();
        } else {
            throw new Error("Product deletion failed");
        }
    }).catch((error) => {
        console.log("fuck");
        console.error(error);
    });
}

function createProduct(event) {
    event.preventDefault();
    const name = productName.value;
    const price = parseFloat(productPrice.value);
    const cost = parseFloat(productCost.value);
    const quantity = parseInt(productQuantity.value);
    
    // cost can't be greater than price
    if (cost > price) {
        alert("Cost of product can't be greater than price!");

    } else {
        fetch(url, {
        method: "POST",
         headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            {
                name: name,
                price: price,
                cost: cost,
                quantity: quantity
            }
        )
    }).then((response) => {
        console.log(response);
        if (response.ok) {
            // products have changed so fetching again
            fetchProducts();
            productDialog.close();
            productName.value = "";
            productPrice.value = "";
            productCost.value = "";
            productQuantity.value = "";
        }
    }).catch((error) => {
        console.error(error);
    });
    }
}



