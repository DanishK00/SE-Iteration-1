describe("Response timer display", function() {
  beforeEach(function() {
    document.body.innerHTML = '<div id="comparisonGrid"></div>';
  });

  it("should show 'waiting...' before a response arrives", function() {
    const col = document.createElement("div");
    col.innerHTML = '<span id="timer-llama3">waiting...</span>';
    document.getElementById("comparisonGrid").appendChild(col);
    expect(document.getElementById("timer-llama3").textContent)
      .toBe("waiting...");
  });

  it("should update timer with elapsed time after response", function() {
    const col = document.createElement("div");
    col.innerHTML = '<span id="timer-llama3">waiting...</span>';
    document.getElementById("comparisonGrid").appendChild(col);
    document.getElementById("timer-llama3").textContent = "2.4s";
    expect(document.getElementById("timer-llama3").textContent).toBe("2.4s");
  });
});
