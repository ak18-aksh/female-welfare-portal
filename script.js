/* ==========================================================
   Female Welfare Portal - JavaScript (Module 4)
   Features: interactive menu, scheme search, contact-form
   validation, live character counter, category hints,
   dynamic footer year.
   Every feature checks that its elements exist, so this one
   file can be loaded safely on all pages.
   ========================================================== */
"use strict";

/* ---------- Validation rules (one function per field) ---------- */
var MESSAGE_MAX = 500;

var validators = {
    name: function (value) {
        var v = value.trim();
        if (v === "") { return "Please enter your full name."; }
        if (v.length < 3) { return "Name must have at least 3 characters."; }
        if (!/^[A-Za-z][A-Za-z .'-]*$/.test(v)) { return "Name can contain only letters and spaces."; }
        return "";
    },
    email: function (value) {
        var v = value.trim();
        if (v === "") { return "Please enter your email address."; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { return "Enter a valid email, e.g. name@example.com."; }
        return "";
    },
    phone: function (value) {               /* optional field */
        var v = value.trim();
        if (v === "") { return ""; }
        var digits = v.replace(/[\s-]/g, "").replace(/^\+91/, "");
        if (!/^[6-9][0-9]{9}$/.test(digits)) { return "Enter a valid 10-digit Indian mobile number."; }
        return "";
    },
    message: function (value) {
        var v = value.trim();
        if (v === "") { return "Please write your message."; }
        if (v.length < 10) { return "Message must have at least 10 characters."; }
        if (v.length > MESSAGE_MAX) { return "Message must be " + MESSAGE_MAX + " characters or fewer."; }
        return "";
    }
};

/* Hint shown under the category drop-down (switch statement) */
function getCategoryHint(category) {
    switch (category) {
        case "schemes":
            return "Tell us which scheme you are asking about.";
        case "helpline":
            return "In an emergency call 181 (Women Helpline) or 112 now. Do not wait for a reply.";
        case "health":
            return "For medical emergencies call 112. We share general information only.";
        case "legal":
            return "Free legal aid is available through your District Legal Services Authority.";
        default:
            return "";
    }
}

/* ---------- Interactive menu (mobile) ---------- */
function setupMenuToggle() {
    var button = document.getElementById("menuToggle");
    var nav = document.getElementById("mainNav");
    if (!button || !nav) { return; }

    button.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("open");
        button.setAttribute("aria-expanded", String(isOpen));
        button.textContent = isOpen ? "\u2715 Close" : "\u2630 Menu";
    });
}

/* ---------- Footer year (Date object) ---------- */
function setCurrentYear() {
    var span = document.getElementById("year");
    if (span) { span.textContent = new Date().getFullYear(); }
}

/* ---------- Scheme search: filters table rows while typing ---------- */
function setupSchemeSearch() {
    var input = document.getElementById("schemeSearch");
    var rows = document.querySelectorAll("#schemeTable tbody tr");
    var count = document.getElementById("resultCount");
    var none = document.getElementById("noResults");
    if (!input || rows.length === 0) { return; }

    function filterRows() {
        var term = input.value.trim().toLowerCase();
        var visible = 0;
        for (var i = 0; i < rows.length; i++) {
            var match = rows[i].textContent.toLowerCase().indexOf(term) !== -1;
            rows[i].hidden = !match;
            if (match) { visible++; }
        }
        if (count) { count.textContent = "Showing " + visible + " of " + rows.length + " schemes"; }
        if (none) { none.hidden = visible !== 0; }
    }

    input.addEventListener("input", filterRows);
    filterRows();
}

/* ---------- Contact form ---------- */
function showFieldError(field, message) {
    var errorBox = document.getElementById(field.id + "Error");
    if (errorBox) { errorBox.textContent = message; }
    field.classList.toggle("invalid", message !== "");
    field.classList.toggle("valid", message === "" && field.value.trim() !== "");
    field.setAttribute("aria-invalid", message !== "" ? "true" : "false");
}

function validateField(field) {
    var rule = validators[field.name];
    var message = rule ? rule(field.value) : "";
    showFieldError(field, message);
    return message === "";
}

function setupContactForm() {
    var form = document.getElementById("inquiryForm");
    if (!form) { return; }

    var fieldNames = Object.keys(validators);          /* name, email, phone, message */
    var fields = [];
    for (var i = 0; i < fieldNames.length; i++) {
        fields.push(form.elements[fieldNames[i]]);
    }
    var status = document.getElementById("formStatus");
    var counter = document.getElementById("charCount");
    var category = document.getElementById("category");
    var hint = document.getElementById("categoryHint");
    var message = form.elements.message;

    /* validate when the user leaves a field, and again while typing */
    fields.forEach(function (field) {
        field.addEventListener("blur", function () { validateField(field); });
        field.addEventListener("input", function () {
            if (field.classList.contains("invalid")) { validateField(field); }
        });
    });

    /* live character counter */
    message.addEventListener("input", function () {
        var used = message.value.length;
        counter.textContent = used + " / " + MESSAGE_MAX;
    });

    /* category hint */
    category.addEventListener("change", function () {
        hint.textContent = getCategoryHint(category.value);
    });
    hint.textContent = getCategoryHint(category.value);

    /* submit */
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var firstInvalid = null;

        for (var j = 0; j < fields.length; j++) {
            if (!validateField(fields[j]) && firstInvalid === null) {
                firstInvalid = fields[j];
            }
        }

        if (firstInvalid !== null) {
            status.textContent = "Please correct the highlighted fields and try again.";
            status.className = "error";
            firstInvalid.focus();
            return;
        }

        var visitor = form.elements.name.value.trim();
        status.textContent = "";
        status.className = "";
        alert("Thank you, " + visitor + "! Your inquiry has been submitted. We will contact you soon.");
        form.reset();
        fields.forEach(function (field) {
            field.classList.remove("valid", "invalid");
            field.removeAttribute("aria-invalid");
        });
        counter.textContent = "0 / " + MESSAGE_MAX;
        hint.textContent = getCategoryHint(category.value);
    });
}

/* ---------- Start everything when the page has loaded ---------- */
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
        setupMenuToggle();
        setCurrentYear();
        setupSchemeSearch();
        setupContactForm();
    });
}

/* Allow the validators to be tested outside the browser (Node.js) */
if (typeof module !== "undefined") { module.exports = { validators: validators, getCategoryHint: getCategoryHint }; }
