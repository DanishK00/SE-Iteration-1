// multiLLMSpec.js
// Jasmine unit tests for the Multi-LLM Compare feature
// Run with: npx jasmine multiLLMSpec.js


describe("Multi-LLM model selection validation", function () {

  const AVAILABLE_MODELS = ["llama3", "mistral", "gemma"];

  function validateModelSelection(models) {
    if (!models || !Array.isArray(models) || models.length === 0) {
      return "At least one model must be selected.";
    }
    const validModels = models.filter(m => AVAILABLE_MODELS.includes(m));
    if (validModels.length === 0) {
      return "No valid models selected.";
    }
    return "Valid selection.";
  }

  it("should reject an empty models array", function () {
    expect(validateModelSelection([]))
      .toBe("At least one model must be selected.");
  });

  it("should reject a missing models value", function () {
    expect(validateModelSelection(null))
      .toBe("At least one model must be selected.");
  });

  it("should reject models that are not in the available list", function () {
    expect(validateModelSelection(["fakemodel", "notreal"]))
      .toBe("No valid models selected.");
  });

  it("should accept a single valid model", function () {
    expect(validateModelSelection(["llama3"]))
      .toBe("Valid selection.");
  });

  it("should accept multiple valid models", function () {
    expect(validateModelSelection(["llama3", "mistral"]))
      .toBe("Valid selection.");
  });

  it("should accept selection even if some models are invalid", function () {
    // llama3 is valid even though fakemodel is not
    expect(validateModelSelection(["llama3", "fakemodel"]))
      .toBe("Valid selection.");
  });

});



describe("Multi-LLM prompt validation", function () {

  function validatePrompt(prompt) {
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return "Prompt is required.";
    }
    return "Valid prompt.";
  }

  it("should reject an empty prompt", function () {
    expect(validatePrompt("")).toBe("Prompt is required.");
  });

  it("should reject a whitespace-only prompt", function () {
    expect(validatePrompt("     ")).toBe("Prompt is required.");
  });

  it("should reject a null prompt", function () {
    expect(validatePrompt(null)).toBe("Prompt is required.");
  });

  it("should accept a valid prompt string", function () {
    expect(validatePrompt("What is recursion?")).toBe("Valid prompt.");
  });

});



describe("Multi-LLM page model checkbox selection", function () {

  beforeEach(function () {
    document.body.innerHTML = `
      <div class="checkbox-group">
        <label><input type="checkbox" name="model" value="llama3" checked> llama3</label>
        <label><input type="checkbox" name="model" value="mistral"> mistral</label>
        <label><input type="checkbox" name="model" value="gemma"> gemma</label>
      </div>
    `;
  });

  function getSelectedModels() {
    return Array.from(document.querySelectorAll('input[name="model"]:checked'))
      .map(cb => cb.value);
  }

  it("should have llama3 checked by default", function () {
    const selected = getSelectedModels();
    expect(selected).toContain("llama3");
  });

  it("should return only checked models", function () {
    document.querySelector('input[value="mistral"]').checked = true;
    const selected = getSelectedModels();
    expect(selected).toContain("llama3");
    expect(selected).toContain("mistral");
    expect(selected).not.toContain("gemma");
  });

  it("should return empty array when no models are checked", function () {
    document.querySelector('input[value="llama3"]').checked = false;
    const selected = getSelectedModels();
    expect(selected.length).toBe(0);
  });

  it("should return all three models when all are checked", function () {
    document.querySelector('input[value="mistral"]').checked = true;
    document.querySelector('input[value="gemma"]').checked = true;
    const selected = getSelectedModels();
    expect(selected.length).toBe(3);
  });

});



describe("Multi-LLM comparison grid rendering", function () {

  beforeEach(function () {
    document.body.innerHTML = `
      <div id="comparisonGrid"></div>
      <input id="promptInput" type="text" />
    `;
  });

  function renderResultRow(prompt, results) {
    const grid = document.getElementById("comparisonGrid");
    const row = document.createElement("div");
    row.className = "comparison-row";

    const promptLabel = document.createElement("div");
    promptLabel.className = "prompt-label";
    promptLabel.textContent = "You: " + prompt;
    row.appendChild(promptLabel);

    const cols = document.createElement("div");
    cols.className = "response-columns";
    results.forEach(function (result) {
      const col = document.createElement("div");
      col.className = "response-col";
      col.innerHTML = `
        <div class="model-tag">${result.model}</div>
        <div class="response-body">${result.response || result.error}</div>
      `;
      cols.appendChild(col);
    });

    row.appendChild(cols);
    grid.appendChild(row);
  }

  it("should display the user prompt in the grid", function () {
    renderResultRow("What is recursion?", [
      { model: "llama3", response: "A function calling itself." }
    ]);
    expect(document.getElementById("comparisonGrid").innerHTML)
      .toContain("What is recursion?");
  });

  it("should display the model name in the response column", function () {
    renderResultRow("Hello", [
      { model: "mistral", response: "Hello there!" }
    ]);
    expect(document.getElementById("comparisonGrid").innerHTML)
      .toContain("mistral");
  });

  it("should display the model response text", function () {
    renderResultRow("Hello", [
      { model: "llama3", response: "Hi! How can I help?" }
    ]);
    expect(document.getElementById("comparisonGrid").innerHTML)
      .toContain("Hi! How can I help?");
  });

  it("should create one column per model in the result", function () {
    renderResultRow("Hello", [
      { model: "llama3", response: "Response from llama3" },
      { model: "mistral", response: "Response from mistral" }
    ]);
    const cols = document.querySelectorAll(".response-col");
    expect(cols.length).toBe(2);
  });

  it("should not add a row when prompt is empty", function () {
    const prompt = "   ";
    if (prompt.trim() !== "") {
      renderResultRow(prompt, [{ model: "llama3", response: "Something" }]);
    }
    const rows = document.querySelectorAll(".comparison-row");
    expect(rows.length).toBe(0);
  });

});



describe("searchLogs on multi-LLM comparison grid", function () {

  beforeEach(function () {
    document.body.innerHTML = `
      <div id="comparisonGrid">
        <div class="prompt-label">You: What is recursion?</div>
        <div class="response-body">A function that calls itself.</div>
        <div class="response-body">Recursion means self-reference.</div>
      </div>
      <input type="text" id="searchInput" />
    `;

    window.searchLogs = function () {
      const input = document.getElementById("searchInput").value.toLowerCase();
      document.querySelectorAll(".response-body, .prompt-label").forEach(function (el) {
        el.style.backgroundColor = (input && el.textContent.toLowerCase().includes(input))
          ? "#ffff99"
          : "";
      });
    };
  });

  it("should highlight elements that match the search term", function () {
    document.getElementById("searchInput").value = "recursion";
    searchLogs();
    const els = document.querySelectorAll(".prompt-label, .response-body");
    // "You: What is recursion?" and "Recursion means self-reference." should match
    expect(els[0].style.backgroundColor).toBe("rgb(255, 255, 153)");
    expect(els[2].style.backgroundColor).toBe("rgb(255, 255, 153)");
  });

  it("should not highlight elements that do not match", function () {
    document.getElementById("searchInput").value = "recursion";
    searchLogs();
    const els = document.querySelectorAll(".response-body");
    // "A function that calls itself." does not contain "recursion"
    expect(els[0].style.backgroundColor).toBe("");
  });

  it("should clear highlights when search input is empty", function () {
    document.getElementById("searchInput").value = "";
    searchLogs();
    document.querySelectorAll(".response-body, .prompt-label").forEach(function (el) {
      expect(el.style.backgroundColor).toBe("");
    });
  });

});



describe("Logout button on Multi-LLM page", function () {

  it("should redirect to login page on click", function () {
    document.body.innerHTML = '<button id="logoutBtn"></button>';
    const btn = document.getElementById("logoutBtn");

    let redirected = "";
    spyOn(window.location, "assign").and.callFake(function (url) {
      redirected = url;
    });

    btn.addEventListener("click", function () {
      window.location.assign("../login/index.html");
    });

    btn.click();
    expect(redirected).toBe("../login/index.html");
  });

});