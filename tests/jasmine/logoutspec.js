describe("Logout button", function() {
    it("should redirect to login page on click", function() {
        
        document.body.innerHTML = '<button id="logoutBtn"></button>';
        const btn = document.getElementById("logoutBtn");
        
      
        let redirected = "";
        spyOn(window.location, 'assign').and.callFake(function(url) { redirected = url; });

        btn.addEventListener("click", function() {
            window.location.assign("../login/index.html");
        });

        btn.click();
        expect(redirected).toBe("../login/index.html");
    });
});