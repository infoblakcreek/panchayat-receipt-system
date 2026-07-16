// ==========================================
// NEW BILL
// ==========================================

const newBillBtn =
    document.getElementById("newBillBtn");


newBillBtn.addEventListener("click", function () {

    const confirmNewBill =
        confirm(
            "Are you sure you want to start a new bill?"
        );


    if (!confirmNewBill) {

        return;

    }


    // Clear customer details

    document.getElementById("customerName").value = "";

    document.getElementById("village").value = "";

    document.getElementById("taluka").value = "";

    document.getElementById("district").value = "";

    document.getElementById("billNo").value = "";

    document.getElementById("billDate").value = "";


    // Clear bank details

    document.getElementById("bankDetails").value = "";


    // Clear amount fields

    document.getElementById("grandTotal").value = "";

    document.getElementById("numberToGujaratiWords").value = "";


    // Remove all existing rows

    const itemBody =
        document.getElementById("itemBody");


    itemBody.innerHTML = "";


    // Add one fresh row

    addRow();


    // Clear duplicate receipt

    document.getElementById("dBillNo").textContent = "";

    document.getElementById("dBillDate").textContent = "";

    document.getElementById("dCustomerName").textContent = "";

    document.getElementById("dVillage").textContent = "";

    document.getElementById("dTaluka").textContent = "";

    document.getElementById("dDistrict").textContent = "";

    document.getElementById("dGrandTotal").textContent = "";

    document.getElementById("dAmountWords").textContent = "";


    alert("New bill is ready!");

});




function calculateRow(input){

    const row = input.closest("tr");

    const pages =
        parseFloat(
            row.querySelector(".pages").value
        ) || 0;

    const price =
        parseFloat(
            row.querySelector(".price").value
        ) || 0;

    const total = pages * price;

    row.querySelector(".total").value =
        total.toFixed(2);

    calculateGrandTotal();
}

function calculateGrandTotal(){

    let sum = 0;

    document.querySelectorAll(".total")
    .forEach(function(item){

        sum += parseFloat(item.value) || 0;

    });

    document.getElementById("grandTotal")
        .value = sum.toFixed(2);
}

function addRow() {

    const tbody = document.getElementById("itemBody");

    const rowCount = tbody.rows.length + 1;

    const row = document.createElement("tr");

    row.className = "data-row";

    row.innerHTML = `
        <td>
            <input class="table-input srno"
                   type="number"
                   value="${rowCount}"
                   readonly>
        </td>

        <td>
            <textarea class="description" rows="2"></textarea>
        </td>

        <td>
            <input class="table-input pages"
                   type="number"
                   oninput="calculateRow(this)">
        </td>

        <td>
            <input class="table-input price"
                   type="number"
                   step="0.01"
                   oninput="calculateRow(this)">
        </td>

        <td>
            <input class="table-input total"
                   type="number"
                   readonly>
        </td>

        <td>
            <button class="delete-btn"
                    onclick="deleteCurrentRow(this)">
                🗑
            </button>
        </td>
    `;

    tbody.appendChild(row);

    updateSerialNumbers();
}


function deleteCurrentRow(button) {

    const tbody = document.getElementById("itemBody");

    if (tbody.rows.length === 1) {
        alert("At least one row is required.");
        return;
    }

    button.closest("tr").remove();

    updateSerialNumbers();
}


function updateSerialNumbers() {

    const rows = document.querySelectorAll("#itemBody tr");

    rows.forEach((row, index) => {

        row.querySelector(".srno").value = index + 1;

    });

}


/*==========================================
        BILL SYNC
==========================================*/

function syncBills(){

    document.getElementById("dCustomerName").innerText =
        document.getElementById("customerName").value;

    document.getElementById("dBillDate").innerText =
        document.getElementById("billDate").value;

    document.getElementById("dVillage").innerText =
        document.getElementById("village").value;

    document.getElementById("dTaluka").innerText =
        document.getElementById("taluka").value;

    document.getElementById("dDistrict").innerText =
        document.getElementById("district").value;

    document.getElementById("dBillNo").innerText =
        document.getElementById("billNo").value;

    document.getElementById("dGrandTotal").innerText =
        document.getElementById("grandTotal").value;

    document.getElementById("dAmountWords").innerText =
        document.getElementById("numberToGujaratiWords").value;

}

/*==========================================
        LIVE SYNC
==========================================*/

const syncFields = [

    "customerName",
    "billDate",
    "village",
    "taluka",
    "district",
    "billNo",
    "grandTotal",
    "numberToGujaratiWords"
];

syncFields.forEach(function(id){

    document.getElementById(id).addEventListener("input", syncBills);

});

syncBills();


document
    .getElementById("pdf-generate")
    .addEventListener("click", generatePDF);


async function generatePDF() {

    const billNumber =
        document
            .getElementById("billNo")
            .value
            .trim();


    if (!billNumber) {

        alert("Please enter Bill Number first.");

        return;

    }


    const billPage =
        document.querySelector(".page");


    const buttons =
        document.querySelector(".tableButtons");


    // Hide buttons temporarily
    buttons.style.display = "none";


    const canvas =
        await html2canvas(
            billPage,
            {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff"
            }
        );


    const imageData =
        canvas.toDataURL("image/png");


    const {
        jsPDF
    } = window.jspdf;


    const pdf =
        new jsPDF(
            "p",
            "mm",
            "a4"
        );


    const pageWidth =
        pdf.internal.pageSize.getWidth();


    const pageHeight =
        pdf.internal.pageSize.getHeight();


    const imageWidth =
        pageWidth;


    const imageHeight =
        canvas.height *
        imageWidth /
        canvas.width;


    pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        imageWidth,
        imageHeight
    );


    pdf.save(
        `Bill-${billNumber}.pdf`
    );


    // Show buttons again
    buttons.style.display = "flex";

}
