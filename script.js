// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyCCgBmxUaqH-5EWo6O83imC81RXVZcZaH8",
  authDomain: "panchayat-bill-system.firebaseapp.com",
  projectId: "panchayat-bill-system",
  storageBucket: "panchayat-bill-system.firebasestorage.app",
  messagingSenderId: "9498305655",
  appId: "1:9498305655:web:9f86a8eff58ef5bb8e5272"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Initialize Firestore
const db = firebase.firestore();

console.log("Firebase connected successfully!");

// ==========================================
// GENERATE RANDOM BILL NUMBER
// ==========================================

async function generateBillNumber() {

    const currentYear =
        new Date()
            .getFullYear();


    let billNumber;

    let exists = true;


    while (exists) {

        // Randomly choose 6 or 7 digits
        const digitCount =
            Math.random() < 0.5
                ? 6
                : 7;


        const min =
            digitCount === 6
                ? 100000
                : 1000000;


        const max =
            digitCount === 6
                ? 999999
                : 9999999;


        const randomNumber =
            Math.floor(
                Math.random() *
                (max - min + 1)
            ) + min;


        billNumber =
            `${currentYear}-${randomNumber}`;


        // Check if this bill number already exists
        const existingBill =
            await db
                .collection("bills")
                .doc(billNumber)
                .get();


        exists =
            existingBill.exists;

    }


    return billNumber;

}
// ==========================================
// SET INITIAL BILL
// ==========================================

async function setInitialBillNumber(){

    const billNumber =
        await generateBillNumber();

    document
        .getElementById("billNo")
        .value =
        billNumber;

    document
        .getElementById("dPavtiNo")
        .value =
        "";
  
    document
        .getElementById("dPavtiDate")
        .value =
        "";


    syncBills();

}
// ==========================================
// SAVE BILL BUTTON
// ==========================================

const saveBillBtn =
    document.getElementById("saveBillBtn");


saveBillBtn.addEventListener("click", saveBill);

async function saveBill() {

    // Normal save should not show cut line

    document.body.classList.remove(
        "showCutLine"
    );


    try {

        await saveCurrentBill();


        alert(
            "Bill saved successfully!"
        );


    } catch(error) {

        console.error(
            "Error saving bill:",
            error
        );


        alert(
            "Error saving bill. Please try again."
        );

    }

}

async function saveCurrentBill() {

    const items = [];


    document
        .querySelectorAll("#itemBody tr")
        .forEach(function(row) {

            const item = {

                description:
                    row.querySelector(
                        ".description"
                    ).value,

                pages:
                    row.querySelector(
                        ".pages"
                    ).value,

                price:
                    row.querySelector(
                        ".price"
                    ).value,

                total:
                    row.querySelector(
                        ".total"
                    ).value

            };


            items.push(item);

        });


    const billData = {

    customerName:
        document
            .getElementById(
                "customerName"
            ).value,

    mobileNumber:
        document
            .getElementById(
                "mobileNumber"
            ).value.trim(),

    village:
        document
            .getElementById(
                "village"
            ).value,

    taluka:
        document
            .getElementById(
                "taluka"
            ).value,

    district:
        document
            .getElementById(
                "district"
            ).value,

    billNo:
        document
            .getElementById(
                "billNo"
            ).value,

    billDate:
        document
            .getElementById(
                "billDate"
            ).value,

     paymentDetails:
          document
              .getElementById(
                  "paymentDetails"
              ).value
              .trim(),

    grandTotal:
        document
            .getElementById(
                "grandTotal"
            ).value,

    amountInWords:
        document
            .getElementById(
                "numberToGujaratiWords"
            ).value,

    items: items

};


    const billNumber =
        billData.billNo.trim();


    if (!billNumber) {

        throw new Error(
            "Bill number is missing."
        );

    }

  const billReference =
    db
        .collection("bills")
        .doc(billNumber);


const existingBill =
    await billReference.get();


const dataToSave = {

    ...billData,

    updatedAt:
        firebase.firestore
            .FieldValue
            .serverTimestamp()

};


if (!existingBill.exists) {

    dataToSave.createdAt =
        firebase.firestore
            .FieldValue
            .serverTimestamp();

}


await billReference.set(
    dataToSave,
    {
        merge: true
    }
);


    await db
        .collection("bills")
        .doc(billNumber)
        .set({

            ...billData,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        });


    return billData;

}
// ==========================================
// SEARCH BILL MODAL
// ==========================================

const searchBillBtn =
    document.getElementById(
        "searchBillBtn"
    );


const searchBillModal =
    document.getElementById(
        "searchBillModal"
    );


const closeSearchModal =
    document.getElementById(
        "closeSearchModal"
    );


const cancelSearchBtn =
    document.getElementById(
        "cancelSearchBtn"
    );


const confirmSearchBtn =
    document.getElementById(
        "confirmSearchBtn"
    );


const searchBillNumber =
    document.getElementById(
        "searchBillNumber"
    );


const searchBillMessage =
    document.getElementById(
        "searchBillMessage"
    );


// Open modal
searchBillBtn.addEventListener(
    "click",
    function() {

        searchBillModal.hidden =
            false;

        searchBillNumber.value =
            "";

        searchBillMessage.textContent =
            "";

        searchBillNumber.focus();

    }
);


// Close modal
function closeSearchBillModal() {

    searchBillModal.hidden =
        true;

}


closeSearchModal.addEventListener(
    "click",
    closeSearchBillModal
);


cancelSearchBtn.addEventListener(
    "click",
    closeSearchBillModal
);

// ==========================================
// SEARCH BILL FROM FIREBASE
// ==========================================

confirmSearchBtn.addEventListener(
    "click",
    searchBill
);


async function searchBill() {

    const billNumber =
        searchBillNumber
            .value
            .trim();


    if (!billNumber) {

        searchBillMessage.textContent =
            "Please enter a bill number.";

        return;

    }


    searchBillMessage.textContent =
        "Searching...";


    try {

        const billDocument =
            await db
                .collection("bills")
                .doc(billNumber)
                .get();


        if (!billDocument.exists) {

            searchBillMessage.textContent =
                "Bill not found.";

            return;

        }


        const billData =
            billDocument.data();


        loadBillIntoForm(
            billData
        );


        closeSearchBillModal();


        alert(
            "Bill loaded successfully!"
        );


    } catch (error) {

        console.error(
            "Error searching bill:",
            error
        );


        searchBillMessage.textContent =
            "Error searching bill.";

    }

}
searchBillNumber.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            searchBill();

        }

    }
);

// ==========================================
// LOAD BILL INTO FORM
// ==========================================

function loadBillIntoForm(billData) {

    document
        .getElementById("customerName")
        .value =
        billData.customerName || "";


    document
        .getElementById("village")
        .value =
        billData.village || "";


    document
        .getElementById("taluka")
        .value =
        billData.taluka || "";


    document
        .getElementById("district")
        .value =
        billData.district || "";


    document
        .getElementById(
            "mobileNumber"
        )
        .value =
            billData.mobileNumber || "";


    document
          .getElementById(
              "paymentDetails"
          )
          .value =
          billData.paymentDetails || "";

    document
        .getElementById("billNo")
        .value =
        billData.billNo || "";


    document
        .getElementById("billDate")
        .value =
        billData.billDate || "";

    document
        .getElementById("dPavtiNo")
        .value =
        billData.pavtiNo || "";

    document
        .getElementById("dPavtiDate")
        .value =
        billData.pavtiDate || "";

    const duplicateReceipt =
    document
        .getElementById(
            "duplicateReceipt"
        );


if(
    billData.pavtiNo
){

    duplicateReceipt.hidden =
        false;

    document.body.classList.add(
        "showCutLine"
    );

}else{

    duplicateReceipt.hidden =
        true;

    document.body.classList.remove(
        "showCutLine"
    );

}

    document
        .getElementById("grandTotal")
        .value =
        billData.grandTotal || "";


    document
        .getElementById(
            "numberToGujaratiWords"
        )
        .value =
        billData.amountInWords || "";


    // Load all item rows
    loadBillItems(
        billData.items || []
    );


    // Update duplicate receipt
    syncBills();

}


// ==========================================
// LOAD BILL ITEMS
// ==========================================

function loadBillItems(items) {

    const tbody =
        document.getElementById(
            "itemBody"
        );


    // Remove current rows
    tbody.innerHTML = "";


    items.forEach(function(item) {

        const row =
            document.createElement("tr");


        row.className =
            "data-row";


        row.innerHTML = `

            <td>
                <input
                    class="table-input srno"
                    type="number"
                    readonly>
            </td>


            <td>
                <textarea
                    class="description"
                    rows="2">${item.description || ""}</textarea>
            </td>


            <td>
                <input
                    class="table-input pages"
                    type="number"
                    value="${item.pages || ""}"
                    oninput="calculateRow(this)">
            </td>


            <td>
                <input
                    class="table-input price"
                    type="number"
                    step="0.01"
                    value="${item.price || ""}"
                    oninput="calculateRow(this)">
            </td>


            <td>
                <input
                    class="table-input total"
                    type="number"
                    value="${item.total || ""}"
                    readonly>
            </td>


            <td>
                <button
                    class="delete-btn"
                    onclick="deleteCurrentRow(this)">
                    🗑
                </button>
            </td>

        `;


        tbody.appendChild(row);

    });


    updateSerialNumbers();

}
// ==========================================
// NEW BILL
// ==========================================

const newBillBtn =
    document.getElementById("newBillBtn");


newBillBtn.addEventListener("click", async function () {

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

    const newBillNumber =
    await generateBillNumber();
  
    // Put it in main bill
    document.getElementById("billNo").value =newBillNumber;
    document.getElementById("dPavtiNo").value ="";

    document.getElementById("billDate").value = "";
    document.getElementById("dPavtiDate").value = "";

    document.getElementById("mobileNumber").value ="";

    // Clear bank details

    document.getElementById("paymentDetails").value = "";


    // Clear amount fields

    document.getElementById("grandTotal").value = "";

    document.getElementById("numberToGujaratiWords").value = "";

    document.body.classList.remove("showCutLine");

    document .getElementById("duplicateReceipt")  .hidden =  true;


    // Remove all existing rows

    const itemBody =
        document.getElementById("itemBody");


    itemBody.innerHTML = "";


    // Add one fresh row

    addItemRow();


    // Clear duplicate receipt

    document.getElementById("dCustomerName").textContent = "";

    document.getElementById("dVillage").textContent = "";

    document.getElementById("dTaluka").textContent = "";

    document.getElementById("dDistrict").textContent = "";

    document.getElementById("dGrandTotal").textContent = "";

    document.getElementById("dAmountWords").textContent = "";


    alert("New bill is ready!");
  syncBills();

});

// ==========================================
// PRINT BILL
// ==========================================


const printBillBtn =
    document.getElementById(
        "printBillBtn"
    );


printBillBtn.addEventListener(
    "click",
    function(){

        generatePrintableBills();

        document.body.classList.add(
            "printGeneratedBills"
        );

        window.print();

        saveCurrentBill()
            .then(function(){

                console.log(
                    "Bill automatically saved after printing."
                );

            })
            .catch(function(error){

                console.error(
                    "Error automatically saving bill:",
                    error
                );

            });

    }
);

window.addEventListener(
    "afterprint",
    function(){

        document.body.classList.remove(
            "printGeneratedBills"
        );

    }
);


// ==========================================
//CALCULATE TOTAL AND GRAND TOTAL
// ==========================================

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
window.calculateRow = calculateRow;

function calculateGrandTotal(){

    let sum = 0;

    document.querySelectorAll(".total")
    .forEach(function(item){

        sum += parseFloat(item.value) || 0;

    });

    document.getElementById("grandTotal")
        .value = sum.toFixed(2);
}

function addItemRow() {

    
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
const addRowBtn =
    document.getElementById("addRow");

addRowBtn.addEventListener(
    "click",
    addItemRow
);

function deleteCurrentRow(button) {

    const tbody = document.getElementById("itemBody");

    if (tbody.rows.length === 1) {
        alert("At least one row is required.");
        return;
    }

    button.closest("tr").remove();

    updateSerialNumbers();
}
window.deleteCurrentRow = deleteCurrentRow;


function updateSerialNumbers() {

    const rows = document.querySelectorAll("#itemBody tr");

    rows.forEach((row, index) => {

        row.querySelector(".srno").value = index + 1;

    });

}


// ==========================================
// GENERATE PAVTI NUMBER
// ==========================================

async function generatePavtiNumber(){

    const currentYear =
        new Date()
            .getFullYear();


    const counterRef =
        db
            .collection("settings")
            .doc(
                `receiptCounter_${currentYear}`
            );


    const pavtiNumber =
        await db.runTransaction(

            async function(transaction){

                const counterDoc =
                    await transaction.get(
                        counterRef
                    );


                let lastNumber = 0;


                if(
                    counterDoc.exists
                ){

                    lastNumber =
                        counterDoc
                            .data()
                            .lastNumber || 0;

                }


                const nextNumber =
                    lastNumber + 1;


                transaction.set(

                    counterRef,

                    {

                        lastNumber:
                            nextNumber,

                        year:
                            currentYear

                    },

                    {

                        merge:true

                    }

                );


                return nextNumber;

            }

        );


    return `${currentYear}-${String(
        pavtiNumber
    ).padStart(6,"0")}`;

}

// ==========================================
// GENERATE RECEIPT BUTTON
// ==========================================

const generateReceiptBtn =
    document.getElementById(
        "generateReceiptBtn"
    );


generateReceiptBtn.addEventListener(
    "click",
    generateReceipt
);


function generateReceipt() {

    try {

        generatePrintableBills();

        /* ==========================================
                GET FORM VALUES
        ========================================== */

        const customerName =
            document.getElementById("customerName").value.trim();

        const village =
            document.getElementById("village").value.trim();

        const taluka =
            document.getElementById("taluka").value.trim();

        const district =
            document.getElementById("district").value.trim();

        const mobileNumber =
            document.getElementById("mobileNumber").value.trim();

        const billNo =
            document.getElementById("billNo").value.trim();

        const billDate =
            document.getElementById("billDate").value;

        const paymentDetails =
            document.getElementById("paymentDetails").value.trim();

        const grandTotal =
            document.getElementById("grandTotal").value;

        const amountWords =
            document.getElementById("numberToGujaratiWords").value;


        /* ==========================================
                CREATE RECEIPT NUMBER
        ========================================== */

        const receiptNumber =
            "P-" + billNo;


        /* ==========================================
                MAIN GENERATED BILL
        ========================================== */

        document.getElementById("pCustomerName").textContent =
            customerName;

        document.getElementById("pVillage").textContent =
            village;

        document.getElementById("pTaluka").textContent =
            taluka;

        document.getElementById("pDistrict").textContent =
            district;

        document.getElementById("pMobileNumber").textContent =
            mobileNumber;

        document.getElementById("pBillNo").textContent =
            billNo;

        document.getElementById("pBillDate").textContent =
            billDate;

        document.getElementById("pAmountWords").textContent =
            amountWords;

        document.getElementById("pGrandTotal").textContent =
            grandTotal;

        document.getElementById("pPaymentDetails").textContent =
            paymentDetails;


        /* ==========================================
                DUPLICATE RECEIPT
        ========================================== */

        document.getElementById("dPavtiNo").value =
            receiptNumber;

        document.getElementById("dPavtiDate").value =
            billDate;


        document.getElementById("dCustomerName").textContent =
            customerName;

        document.getElementById("dVillage").textContent =
            village;

        document.getElementById("dTaluka").textContent =
            taluka;

        document.getElementById("dDistrict").textContent =
            district;

        document.getElementById("dGrandTotal").textContent =
            grandTotal;

        document.getElementById("dAmountWords").textContent =
            amountWords;

        document.getElementById("dPaymentDetails").textContent =
            paymentDetails;


        /* ==========================================
                SHOW GENERATED RECEIPT PAGE
        ========================================== */

        document.body.classList.add(
            "receiptGeneratedMode"
        );


        document
            .getElementById("printableBills")
            .style.display = "flex";


        window.scrollTo(
            0,
            0
        );


    } catch (error) {

        console.error(
            "Error generating receipt:",
            error
        );

        alert(
            "Error generating receipt: " +
            error.message
        );

    }

}
/*==========================================
        BILL SYNC
==========================================*/

function syncBills(){

    const customerName =
        document.getElementById("customerName");

    const village =
        document.getElementById("village");

    const taluka =
        document.getElementById("taluka");

    const district =
        document.getElementById("district");

    const grandTotal =
        document.getElementById("grandTotal");

    const amountWords =
        document.getElementById(
            "numberToGujaratiWords"
        );


    const dCustomerName =
        document.getElementById(
            "dCustomerName"
        );

    const dVillage =
        document.getElementById(
            "dVillage"
        );

    const dTaluka =
        document.getElementById(
            "dTaluka"
        );

    const dDistrict =
        document.getElementById(
            "dDistrict"
        );

    const dGrandTotal =
        document.getElementById(
            "dGrandTotal"
        );

    const dAmountWords =
        document.getElementById(
            "dAmountWords"
        );


    const paymentDetails =
    document.getElementById(
        "paymentDetails"
    );

    const dPaymentDetails =
        document.getElementById(
            "dPaymentDetails"
        );

      if (
          dPaymentDetails &&
          paymentDetails
      ) {
      
          dPaymentDetails.innerText =
              paymentDetails.value;
      
      }
  
    if(
        dCustomerName &&
        customerName
    ){

        dCustomerName.innerText =
            customerName.value;

    }


    if(
        dVillage &&
        village
    ){

        dVillage.innerText =
            village.value;

    }


    if(
        dTaluka &&
        taluka
    ){

        dTaluka.innerText =
            taluka.value;

    }


    if(
        dDistrict &&
        district
    ){

        dDistrict.innerText =
            district.value;

    }


    if(
        dGrandTotal &&
        grandTotal
    ){

        dGrandTotal.innerText =
            grandTotal.value;

    }


    if(
        dAmountWords &&
        amountWords
    ){

        dAmountWords.innerText =
            amountWords.value;

    }

}

/*==========================================
        LIVE SYNC
==========================================*/

const syncFields = [

    "customerName",
    "village",
    "taluka",
    "district",
    "grandTotal",
    "numberToGujaratiWords",
    "paymentDetails"

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

        alert(
            "Please enter Bill Number first."
        );

        return;

    }


    const billPage =
        document.querySelector(
            ".page"
        );


    const buttons =
        document.querySelector(
            ".tableButtons"
        );


    try {

        // Show cut line temporarily

        document.body.classList.add(
            "showCutLine"
        );


        // Hide buttons temporarily

        buttons.style.display =
            "none";


        // Generate image

        const canvas =
            await html2canvas(

                billPage,

                {

                    scale:2,

                    useCORS:true,

                    backgroundColor:
                        "#ffffff"

                }

            );


        const imageData =
            canvas.toDataURL(
                "image/png"
            );


        const {
            jsPDF
        } =
            window.jspdf;


        const pdf =
            new jsPDF(

                "p",

                "mm",

                "a4"

            );


        const pageWidth =
            pdf.internal.pageSize
                .getWidth();


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


    }

    catch(error){

        console.error(

            "Error generating PDF:",

            error

        );


        alert(

            "Unable to generate PDF."

        );

    }


    finally {

        // Hide cut line again

        document.body.classList.remove(

            "showCutLine"

        );


        // Show buttons again

        buttons.style.display =
            "flex";

    }

}


// ==========================================
// GENERATE PRINT TABLES
// ==========================================

function generatePrintableBills() {

    /*
    ==========================================
        MAIN BILL DETAILS
    ==========================================
    */

    document.getElementById(
        "pCustomerName"
    ).textContent =
        document.getElementById(
            "customerName"
        ).value;


    document.getElementById(
        "pBillNo"
    ).textContent =
        document.getElementById(
            "billNo"
        ).value;


    document.getElementById(
        "pVillage"
    ).textContent =
        document.getElementById(
            "village"
        ).value;


    document.getElementById(
        "pTaluka"
    ).textContent =
        document.getElementById(
            "taluka"
        ).value;


    document.getElementById(
        "pDistrict"
    ).textContent =
        document.getElementById(
            "district"
        ).value;


    document.getElementById(
        "pBillDate"
    ).textContent =
        document.getElementById(
            "billDate"
        ).value;

      document.getElementById(
        "pMobileNumber"
    ).textContent =
        document.getElementById(
            "mobileNumber"
        ).value;


    document.getElementById(
        "pAmountWords"
    ).textContent =
        document.getElementById(
            "numberToGujaratiWords"
        ).value;


    document.getElementById(
        "pGrandTotal"
    ).textContent =
        document.getElementById(
            "grandTotal"
        ).value;


    document.getElementById(
        "pPaymentDetails"
    ).textContent =
        document.getElementById(
            "paymentDetails"
        ).value;


    /*
    ==========================================
        CREATE MAIN BILL ITEM ROWS
    ==========================================
    */

    const printItems =
        document.getElementById(
            "printMainItems"
        );


    printItems.innerHTML = "";


    document
        .querySelectorAll(
            "#itemBody tr"
        )
        .forEach(function(row) {

          const printRow = document.createElement("tr");
          
            const srno =
                row.querySelector(
                    ".srno"
                ).value;


            const description =
                row.querySelector(
                    ".description"
                ).value;


            const pages =
                row.querySelector(
                    ".pages"
                ).value;


            const price =
                row.querySelector(
                    ".price"
                ).value;


            const total =
                row.querySelector(
                    ".total"
                ).value;


            printRow.innerHTML = `

                <td>
                    ${srno}
                </td>

                <td class="printDescription">
                    ${description}
                </td>

                <td>
                    ${pages}
                </td>

                <td>
                    ₹ ${price}
                </td>

                <td>
                    ₹ ${total}
                </td>

            `;


            printItems.appendChild(
                printRow
            );

        });

}

setInitialBillNumber();
