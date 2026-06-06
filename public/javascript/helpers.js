import { currency } from "./constants.js";

export async function receiptGenerator(sale) {
    const receiptPDF = document.querySelector("#receipt_template");
    const receiptTableBody = document.querySelector("#receipt_table_body");
    const receiptTotal = document.querySelector("#receipt_total");
    const receiptDateTime = document.querySelector("#receipt_datetime");
    receiptTableBody.innerHTML = "";

    const receiptHeight = receiptPDF.offsetHeight;
    const receiptWidth = receiptPDF.offsetWidth;


    receiptDateTime.textContent = formateDateTime(new Date(sale.createdAt));

    for (const product of sale.products) {
        const tr = document.createElement("tr");
        const name = document.createElement("td");
        name.textContent = product.name;
        const quantity = document.createElement("td");
        quantity.textContent = product.quantity;
        const price = document.createElement("td");
        price.textContent = product.price;
        tr.appendChild(name);
        tr.appendChild(quantity);
        tr.appendChild(price);
        receiptTableBody.appendChild(tr);
    }

    receiptTotal.textContent = `${currency}${sale.price}`;

    const opt = {
        filename: `receipt_${sale.createdAt}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
            orientation: 'portrait',
            unit: 'px',
            format: [receiptWidth, receiptHeight],
        }
    };

    await html2pdf().set(opt).from(receiptPDF).save();

}

function formateDateTime(dateTime) {
    const USFormatter = new Intl.DateTimeFormat('en-US');

    const customFormatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
        hour12: true
    });
    return customFormatter.format(dateTime);
}



