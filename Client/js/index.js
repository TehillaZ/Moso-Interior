
document.addEventListener('DOMContentLoaded', () => {

const passwordInput  = document.getElementById('password');
const feedback = document.getElementById('password-feedback');

      // Regular expression for the rules
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{16}$/;

      passwordInput.addEventListener('input', () => {
          const password = passwordInput.value;

          if (regex.test(password)) {
              feedback.textContent = "Password is valid ✅";
              feedback.style.color = "green";
          } else {
              feedback.textContent = "Password must be 16 characters long and include at least one lowercase letter, one uppercase letter, and one number";
              feedback.style.color = "red";
          }
      });

  const btnsend = document.getElementById('btnsend');
  if (btnsend) {
    btnsend.addEventListener('click', async (event) => {
      event.preventDefault();
      const success = await userSignIn();

      if (success) {
        alert('you sign up sucsessfuly! for buying enter by Log In');
        window.location.href = 'index.html';
      }
    });
  }

   const forgotLink = document.getElementById('forgot-link');
    const forgotBox = document.getElementById('forgot-box');

    forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        // החלפה בין מצבי התצוגה
        if (forgotBox.style.display === "none") {
            forgotBox.style.display = "block";
        } else {
            forgotBox.style.display = "none";
        }

    });

const updatebtn = document.getElementById('update-pass');
const emailInput = document.getElementById('forgot-email');



const sendBtn = document.getElementById("update-pass");
const verifyBtn = document.getElementById("reset-pass");
const resetBtn = document.getElementById("reset-btn");
const spinner = document.getElementById("verify-spinner");
const successMark = document.getElementById("verify-success");
const errorMsg = document.getElementById("verify-error");
const codeBox = document.getElementById("code-box");
const resetBox = document.getElementById("reset-box");


sendBtn.addEventListener("click", async () => {
  
  window.email = document.getElementById("forgot-email").value;
  if (!email) return alert("Please enter your email");

  // show reset box
  document.getElementById("forgot-box").style.display = "none";
  document.getElementById("code-box").style.display = "block";

  const res = await fetch("http://localhost:3284/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    
  });

  const data = await res.json();
  console.log(data.message);
  
});

verifyBtn.addEventListener("click", async () => {

  window.code = document.getElementById("verification-code").value;
  
  console.log(email);
   console.log(code);
  
  
  spinner.style.display = "inline-block";
    successMark.style.display = "none";
    errorMsg.style.display = "none";
  
    try {
        const res = await fetch("http://localhost:3284/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code })
        });

        const data = await res.json();

        spinner.style.display = "none";

        if (data.message === "Code verified successfully") {
            successMark.style.display = "inline-block"; 
            setTimeout(() => {
                codeBox.style.display = "none";
                resetBox.style.display = "block";
            }, 800); 
        } else {
            errorMsg.style.display = "block";
        }
    } catch (err) {
        spinner.style.display = "none";
        errorMsg.textContent = "Server error, try again later";
        errorMsg.style.display = "block";
        console.error(err);
    }
});

resetBtn.addEventListener("click", async () => {
  const newPassword = document.getElementById("new-password-final").value
  const secondNewPassword = document.getElementById("new-password-final-2").value
  const errMes = document.getElementById("reset-error")
  const sucMes = document.getElementById("reset-sucsses")
  const errMes2 = document.getElementById("reset-error2")
   const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{16}$/;

   if (regex.test(password)) {
      errMes2.style.display = "block";
      setTimeout(() => {
      errMes.style.display = "none"; 
    }, 3000);  
   }
  else
  {
      if (newPassword !== secondNewPassword)
  {
        errMes.style.display = "block";
        setTimeout(() => {
      errMes.style.display = "none"; 
    }, 3000);
  }
  else
  {
   try {
        const res = await fetch("http://localhost:3284/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, newPassword })
        });

         const data = await res.json();
         console.log(data.message);
         
         if(data.message === "Password reset successfully")
         {
             sucMes.style.display =  "block";
             setTimeout(() => {
            errMes.style.display = "none"; 
            resetBox.style.display = "none";
          }, 4000);
          
         }
   } catch (err) {
  }
}
  }
 
})

  async function userSignIn() {
    const fullname = document.getElementById('full-name').value;
    const address = document.getElementById('Living-Address').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('Email-Address').value;
    const password = document.getElementById('password').value;

    if (!fullname || !address || !phone || !email || !password) {
      alert('please fill the all required fields ');
      return false;
    }

    const user = { fullname, address, phone, email, password };

    try {
      const response = await fetch('http://localhost:3284/users', {
        method: 'POST',
        credentials: 'include' ,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (!response.ok) throw new Error('Failed to register user');

      const data = await response.json();
      console.log('Success:', data);
      return true;
    } catch (error) {
      console.error('Fetch error:', error);
      alert('sign up error');
      return false;
    }
  }
});

function scheduleTokenRefresh(accessToken) {
  if (!accessToken || typeof accessToken !== "string") {
    console.error("Invalid access token:", accessToken); 
    return;
  }
  const payload = JSON.parse(atob(accessToken.split('.')[1])); // decode JWT payload
  const exp = payload.exp * 1000; // ms
  const now = Date.now();

  const refreshTime = exp - now - 30000; // refresh 30s before expiry

  if (refreshTime > 0) {
    setTimeout(async () => {
      await getNewAccessToken();
    }, refreshTime);
  }
}


async function getNewAccessToken() {
  try {
    const response = await fetch('http://localhost:3284/refresh', {
      method: 'GET',
      credentials: 'include' 
    });

    if (!response.ok) throw new Error('Cannot refresh token');

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);

    console.log('Access token refreshed:', data.accessToken);
  } catch (err) {
    console.error(err);
    alert('Session expired, please log in again');
    window.location.href = 'index.html';
  }
}



document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email_login').value;
      const password = document.getElementById('password_login').value;
    
      try {
        const response = await fetch('http://localhost:3284/login', {
          method: 'POST',       
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: "include"
        });

        

        if (!response.ok) {
          const err = await response.json();
          alert('err: ' + err.message);
          return;
        }

        const data = await response.json();
        console.log(data);

        scheduleTokenRefresh(data.accessToken);
      
        if (data.roles === 'admin') {
          alert('connected as manager');
          window.location.href = 'html/manager.html';
        } else {         
          window.location.href = 'html/profile.html';
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    });
  }
});





