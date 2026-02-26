document.querySelector("button").addEventListener("click", function() {
    let date1 = new Date("2004-04-30"); 
    let date2 = new Date();

    let years = date2.getFullYear() - date1.getFullYear();
    let months = date2.getMonth() - date1.getMonth();
    let days = date2.getDate() - date1.getDate();
    let hours = date2.getHours() - date1.getHours();
    let minutes = date2.getMinutes() - date1.getMinutes();
    let seconds = date2.getSeconds() - date1.getSeconds();

    if (days < 0) {
        months--;
        let lastMonth = new Date(date2.getFullYear(), date2.getMonth(), 0);
        days += lastMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    alert(`თქვენი ასაკი: ${years} წელი, ${months} თვე, ${days} დღე, ${hours} საათი, ${minutes} წუთი, ${seconds} წამი`);
});
