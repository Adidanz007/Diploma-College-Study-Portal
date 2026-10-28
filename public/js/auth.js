function setMessage(message, isSuccess) {
    const element = document.getElementById("auth-message");
    element.textContent = message;
    element.classList.toggle("success", isSuccess);
}

function setLoading(form, loading) {
    const button = form.querySelector("button[type='submit']");
    button.disabled = loading;
    button.textContent = loading ? "Please wait..." : button.dataset.label;
}

async function submitAuthForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const isRegister = form.dataset.mode === "register";
    const payload = Object.fromEntries(new FormData(form));

    if (isRegister && payload.password !== payload.confirmPassword) {
        setMessage("Passwords do not match.", false);
        return;
    }

    delete payload.confirmPassword;
    setLoading(form, true);
    setMessage("", false);

    try {
        const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Request failed.");
        }

        if (result.token) {
            sessionStorage.setItem("authToken", result.token);
        }
        setMessage(result.message, true);
        if (!isRegister) {
            window.setTimeout(() => { window.location.href = "/"; }, 700);
        } else {
            form.reset();
        }
    } catch (error) {
        setMessage(error.message || "Unable to contact the server.", false);
    } finally {
        setLoading(form, false);
    }
}

function logoutUser() {
    sessionStorage.removeItem("authToken");
    window.location.href = "/login.html";
}

document.querySelectorAll("[data-logout]").forEach((element) => {
    element.addEventListener("click", logoutUser);
});

document.querySelectorAll("[data-auth-form]").forEach((form) => {
    const button = form.querySelector("button[type='submit']");
    button.dataset.label = button.textContent;
    form.addEventListener("submit", submitAuthForm);
});
