const themeStorageKey = "theme-preference";
const themeToggleButton = document.getElementById("themeToggle");
const themeLabels = {
    auto: "跟随系统",
    light: "浅色模式",
    dark: "深色模式",
};
const themeSequence = ["auto", "light", "dark"];
const supportsMatchMedia = typeof window.matchMedia === "function";
const darkMediaQuery = supportsMatchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
const rootElement = document.documentElement;
let currentTheme = rootElement.dataset.appliedTheme || "auto";
delete rootElement.dataset.appliedTheme;
function applyThemePreference(theme) {
    if (theme === "dark") {
        rootElement.setAttribute("data-theme", "dark");
        rootElement.style.colorScheme = "dark";
        currentTheme = "dark";
        return currentTheme;
    }
    if (theme === "light") {
        rootElement.setAttribute("data-theme", "light");
        rootElement.style.colorScheme = "light";
        currentTheme = "light";
        return currentTheme;
    }
    rootElement.removeAttribute("data-theme");
    const prefersDark = darkMediaQuery ? darkMediaQuery.matches : false;
    rootElement.style.colorScheme = prefersDark ? "dark" : "light";
    currentTheme = "auto";
    return currentTheme;
}
function updateThemeToggleLabel(theme) {
    if (!themeToggleButton) {
        return;
    }
    const label = themeLabels[theme] || themeLabels.auto;
    themeToggleButton.textContent = label;
    themeToggleButton.setAttribute("data-theme-state", theme);
    themeToggleButton.setAttribute("aria-label", `切换主题，当前${label}`);
    themeToggleButton.setAttribute("title", `点击切换主题（${label}）`);
}
function persistTheme(theme) {
    try {
        if (theme === "auto") {
            localStorage.removeItem(themeStorageKey);
        } else {
            localStorage.setItem(themeStorageKey, theme);
        }
    } catch (error) {
        // 无法访问存储时静默失败
    }
}
function handleSystemThemeChange() {
    if (currentTheme === "auto") {
        const appliedTheme = applyThemePreference("auto");
        updateThemeToggleLabel(appliedTheme);
    }
}
currentTheme = applyThemePreference(currentTheme);
updateThemeToggleLabel(currentTheme);
if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
        const currentIndex = themeSequence.indexOf(currentTheme);
        const nextTheme =
            themeSequence[
            (currentIndex + 1 + themeSequence.length) % themeSequence.length
            ];
        const appliedTheme = applyThemePreference(nextTheme);
        persistTheme(appliedTheme);
        updateThemeToggleLabel(appliedTheme);
    });
}
if (darkMediaQuery) {
    if (typeof darkMediaQuery.addEventListener === "function") {
        darkMediaQuery.addEventListener("change", handleSystemThemeChange);
    } else if (typeof darkMediaQuery.addListener === "function") {
        darkMediaQuery.addListener(handleSystemThemeChange);
    }
}
let sex = 1;
const result = document.getElementById("result");
const additionEl = document.getElementById("addition-score");
const totalLevelEl = document.getElementById("total-level");
const rowMap = {
    bmi: {
        value: document.getElementById("bmi-value"),
        score: document.getElementById("bmi-score"),
        level: document.getElementById("bmi-level"),
    },
    breath: {
        value: document.getElementById("breath-value"),
        score: document.getElementById("breath-score"),
        level: document.getElementById("breath-level"),
    },
    sprint: {
        value: document.getElementById("sprint-value"),
        score: document.getElementById("sprint-score"),
        level: document.getElementById("sprint-level"),
    },
    sitreach: {
        value: document.getElementById("sitreach-value"),
        score: document.getElementById("sitreach-score"),
        level: document.getElementById("sitreach-level"),
    },
    longjump: {
        value: document.getElementById("longjump-value"),
        score: document.getElementById("longjump-score"),
        level: document.getElementById("longjump-level"),
    },
    strength: {
        value: document.getElementById("strength-value"),
        score: document.getElementById("strength-score"),
        level: document.getElementById("strength-level"),
    },
    endurance: {
        value: document.getElementById("endurance-value"),
        score: document.getElementById("endurance-score"),
        level: document.getElementById("endurance-level"),
    },
};
const STORAGE_KEY = "tailwind-assessment-form-data";
const persistableNames = [
    "sex",
    "grades",
    "heights",
    "weights",
    "breaths",
    "shortruns",
    "reachs",
    "jumps",
    "pullups",
    "situps",
    "1000runs",
    "800runs",
];
const storageAvailable = (() => {
    try {
        const testKey = "__pe_converter_storage_test__";
        localStorage.setItem(testKey, "ok");
        localStorage.removeItem(testKey);
        return true;
    } catch (err) {
        console.warn("本地存储不可用，输入内容将不会被自动保存。", err);
        return false;
    }
})();
const readFieldValue = (name) => {
    const nodes = Array.from(document.getElementsByName(name));
    if (!nodes.length) return "";
    const first = nodes[0];
    if (first.type === "radio") {
        const checked = nodes.find((node) => node.checked);
        return checked ? checked.value : "";
    }
    return first.value ?? "";
};
const writeFieldValue = (name, value) => {
    const nodes = Array.from(document.getElementsByName(name));
    if (!nodes.length) return;
    const first = nodes[0];
    if (first.type === "radio") {
        nodes.forEach((node) => {
            node.checked = value !== "" && node.value === value;
        });
    } else {
        nodes.forEach((node) => {
            node.value = value ?? "";
        });
    }
};
const saveFormData = () => {
    if (!storageAvailable) return;
    try {
        const payload = {};
        persistableNames.forEach((name) => {
            payload[name] = readFieldValue(name);
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
        console.error("保存表单数据失败", err);
    }
};
const restoreFormData = () => {
    if (!storageAvailable) return;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data || typeof data !== "object") return;
        if (Object.prototype.hasOwnProperty.call(data, "sex") && data.sex) {
            writeFieldValue("sex", data.sex);
        }
        if (Object.prototype.hasOwnProperty.call(data, "grades") && data.grades) {
            writeFieldValue("grades", data.grades);
        }
        change({ skipSave: true });
        persistableNames.forEach((name) => {
            if (name === "sex" || name === "grades") return;
            if (Object.prototype.hasOwnProperty.call(data, name)) {
                writeFieldValue(name, data[name]);
            }
        });
        saveFormData();
    } catch (err) {
        console.error("恢复表单数据失败", err);
    }
};
const setupPersistence = () => {
    if (!storageAvailable) return;
    restoreFormData();
    persistableNames.forEach((name) => {
        const nodes = Array.from(document.getElementsByName(name));
        nodes.forEach((node) => {
            const eventName = node.type === "radio" ? "change" : "input";
            node.addEventListener(eventName, saveFormData);
        });
    });
    const computeButton = document.getElementById("compute");
    if (computeButton) {
        computeButton.addEventListener("click", saveFormData);
    }
};
const scoreToLevel = (score) => {
    if (!Number.isFinite(score)) return "-";
    if (score >= 90) return "优秀";
    if (score >= 80) return "良好";
    if (score >= 60) return "及格";
    return "不及格";
};
const setRow = (key, raw, score, hasValue) => {
    const target = rowMap[key];
    if (!target) return;
    if (!hasValue) {
        target.value.textContent = "-";
        target.score.textContent = "-";
        target.level.textContent = "-";
        return;
    }
    target.value.textContent = raw;
    target.score.textContent = Number.isFinite(score) ? score.toString() : "-";
    target.level.textContent = Number.isFinite(score) ? scoreToLevel(score) : "-";
};
function only_num(obj) {
    var num = obj.value.charAt(0);
    obj.value = obj.value.replace(/[^\d\.]/g, "");
    obj.value = obj.value.replace(/\.{2,}/g, ".");
    obj.value = obj.value
        .replace(".", "$#$")
        .replace(/\./g, "")
        .replace("$#$", ".");
    if (num === "-") {
        obj.value = "-" + obj.value;
    } else if (num === ".") {
        obj.value = "0" + obj.value;
    }
}
function onlyNumber(obj) {
    var t = obj.value.charAt(0);
    if (t == 0) {
        obj.value = "";
    }
    obj.value = obj.value.replace(/[^\d]/g, "");
}
const change = (options = {}) => {
    let gender = document.getElementsByName("sex")[0];
    let run1000 = document.getElementById("1000run");
    let run800 = document.getElementById("800run");
    let pullup = document.getElementById("pullup");
    let situp = document.getElementById("situp");
    let run1000Value = document.getElementsByName("1000runs")[0];
    let run800Value = document.getElementsByName("800runs")[0];
    let pullupValue = document.getElementsByName("pullups")[0];
    let situpValue = document.getElementsByName("situps")[0];
    if (!gender.checked) {
        sex = 0;
        run1000.classList.add("hidden");
        pullup.classList.add("hidden");
        run800.classList.remove("hidden");
        situp.classList.remove("hidden");
        run800Value.value = "";
        situpValue.value = "";
    } else {
        sex = 1;
        run1000.classList.remove("hidden");
        pullup.classList.remove("hidden");
        run800.classList.add("hidden");
        situp.classList.add("hidden");
        run1000Value.value = "";
        pullupValue.value = "";
    }
    setRow("strength", "", 0, false);
    setRow("endurance", "", 0, false);
    if (!options.skipSave) {
        saveFormData();
    }
};
const calculate = () => {
    var score = 0;
    var BMIScore = 0;
    var breathScore = 0;
    var reachScore = 0;
    var jumpScore = 0;
    var shortrunScore = 0;
    var longrunScore = 0;
    var pullupsitupScore = 0;
    var additionScore = 0;
    var grades1 = document.getElementsByName("grades")[0];
    var grade = grades1.checked ? 1 : 0;
    var height = document.getElementsByName("heights")[0].value;
    var weight = document.getElementsByName("weights")[0].value;
    var BMI = document.getElementsByName("BMIs")[0];
    if (height && weight) {
        var heightNum = parseFloat(height);
        var weightNum = parseFloat(weight);
        if (
            heightNum >= 0.1 &&
            heightNum <= 3 &&
            weightNum >= 5 &&
            weightNum <= 500
        ) {
            var newBMI = (weightNum / (heightNum * heightNum)).toFixed(2);
            BMI.value = newBMI;
            if (sex == 1) {
                if (newBMI >= 17.9 && newBMI <= 23.9) {
                    BMIScore = 100;
                } else if (newBMI <= 17.8 || (newBMI >= 24 && newBMI <= 27.9)) {
                    BMIScore = 80;
                } else if (newBMI >= 28) {
                    BMIScore = 60;
                }
            } else {
                if (newBMI >= 17.2 && newBMI <= 23.9) {
                    BMIScore = 100;
                } else if (newBMI <= 17.1 || (newBMI >= 24 && newBMI <= 27.9)) {
                    BMIScore = 80;
                } else if (newBMI >= 28) {
                    BMIScore = 60;
                }
            }
        } else if (heightNum < 1 || heightNum > 3) {
            alert("请输入介于1~3的身高数值");
            BMI.value = "";
        } else if (weightNum < 5 || weightNum > 500) {
            alert("请输入介于5~500的体重数值");
            BMI.value = "";
        }
    } else {
        BMI.value = "";
    }
    var breath = document.getElementsByName("breaths")[0].value;
    if (breath != "") {
        var breathNum = parseFloat(breath);
        if (breathNum < 1000 || breathNum > 10000) {
            alert("请输入介于1000~10000的肺活量数值");
        } else if (sex == 1 && grade == 1) {
            if (breathNum >= 5040) {
                breathScore = 100;
            } else if (breathNum >= 4920) {
                breathScore = 95;
            } else if (breathNum >= 4800) {
                breathScore = 90;
            } else if (breathNum >= 4500) {
                breathScore = 85;
            } else if (breathNum >= 4300) {
                breathScore = 80;
            } else if (breathNum >= 4180) {
                breathScore = 78;
            } else if (breathNum >= 4060) {
                breathScore = 76;
            } else if (breathNum >= 3940) {
                breathScore = 74;
            } else if (breathNum >= 3820) {
                breathScore = 72;
            } else if (breathNum >= 3700) {
                breathScore = 70;
            } else if (breathNum >= 3580) {
                breathScore = 68;
            } else if (breathNum >= 3460) {
                breathScore = 66;
            } else if (breathNum >= 3340) {
                breathScore = 64;
            } else if (breathNum >= 3220) {
                breathScore = 62;
            } else if (breathNum >= 3100) {
                breathScore = 60;
            } else if (breathNum >= 2940) {
                breathScore = 50;
            } else if (breathNum >= 2780) {
                breathScore = 40;
            } else if (breathNum >= 2620) {
                breathScore = 30;
            } else if (breathNum >= 2460) {
                breathScore = 20;
            } else if (breathNum >= 2300) {
                breathScore = 10;
            }
        } else if (sex == 1 && grade == 0) {
            if (breathNum >= 5140) {
                breathScore = 100;
            } else if (breathNum >= 5020) {
                breathScore = 95;
            } else if (breathNum >= 4900) {
                breathScore = 90;
            } else if (breathNum >= 4600) {
                breathScore = 85;
            } else if (breathNum >= 4400) {
                breathScore = 80;
            } else if (breathNum >= 4280) {
                breathScore = 78;
            } else if (breathNum >= 4160) {
                breathScore = 76;
            } else if (breathNum >= 4040) {
                breathScore = 74;
            } else if (breathNum >= 3920) {
                breathScore = 72;
            } else if (breathNum >= 3800) {
                breathScore = 70;
            } else if (breathNum >= 3680) {
                breathScore = 68;
            } else if (breathNum >= 3560) {
                breathScore = 66;
            } else if (breathNum >= 3440) {
                breathScore = 64;
            } else if (breathNum >= 3320) {
                breathScore = 62;
            } else if (breathNum >= 3200) {
                breathScore = 60;
            } else if (breathNum >= 3030) {
                breathScore = 50;
            } else if (breathNum >= 2860) {
                breathScore = 40;
            } else if (breathNum >= 2690) {
                breathScore = 30;
            } else if (breathNum >= 2520) {
                breathScore = 20;
            } else if (breathNum >= 2350) {
                breathScore = 10;
            }
        } else if (sex == 0 && grade == 1) {
            if (breathNum >= 3400) {
                breathScore = 100;
            } else if (breathNum >= 3350) {
                breathScore = 95;
            } else if (breathNum >= 3300) {
                breathScore = 90;
            } else if (breathNum >= 3150) {
                breathScore = 85;
            } else if (breathNum >= 3000) {
                breathScore = 80;
            } else if (breathNum >= 2900) {
                breathScore = 78;
            } else if (breathNum >= 2800) {
                breathScore = 76;
            } else if (breathNum >= 2700) {
                breathScore = 74;
            } else if (breathNum >= 2600) {
                breathScore = 72;
            } else if (breathNum >= 2500) {
                breathScore = 70;
            } else if (breathNum >= 2400) {
                breathScore = 68;
            } else if (breathNum >= 2300) {
                breathScore = 66;
            } else if (breathNum >= 2200) {
                breathScore = 64;
            } else if (breathNum >= 2100) {
                breathScore = 62;
            } else if (breathNum >= 2000) {
                breathScore = 60;
            } else if (breathNum >= 1960) {
                breathScore = 50;
            } else if (breathNum >= 1920) {
                breathScore = 40;
            } else if (breathNum >= 1880) {
                breathScore = 30;
            } else if (breathNum >= 1840) {
                breathScore = 20;
            } else if (breathNum >= 1800) {
                breathScore = 10;
            }
        } else if (sex == 0 && grade == 0) {
            if (breathNum >= 3450) {
                breathScore = 100;
            } else if (breathNum >= 3400) {
                breathScore = 95;
            } else if (breathNum >= 3350) {
                breathScore = 90;
            } else if (breathNum >= 3200) {
                breathScore = 85;
            } else if (breathNum >= 3050) {
                breathScore = 80;
            } else if (breathNum >= 2950) {
                breathScore = 78;
            } else if (breathNum >= 2850) {
                breathScore = 76;
            } else if (breathNum >= 2750) {
                breathScore = 74;
            } else if (breathNum >= 2650) {
                breathScore = 72;
            } else if (breathNum >= 2550) {
                breathScore = 70;
            } else if (breathNum >= 2450) {
                breathScore = 68;
            } else if (breathNum >= 2350) {
                breathScore = 66;
            } else if (breathNum >= 2250) {
                breathScore = 64;
            } else if (breathNum >= 2150) {
                breathScore = 62;
            } else if (breathNum >= 2050) {
                breathScore = 60;
            } else if (breathNum >= 2010) {
                breathScore = 50;
            } else if (breathNum >= 1970) {
                breathScore = 40;
            } else if (breathNum >= 1930) {
                breathScore = 30;
            } else if (breathNum >= 1890) {
                breathScore = 20;
            } else if (breathNum >= 1850) {
                breathScore = 10;
            }
        }
    }
    var reach = document.getElementsByName("reachs")[0].value;
    if (reach != "") {
        var reachNum = parseFloat(reach);
        if (reachNum < -20 || reachNum > 100) {
            alert("请输入介于-20~100的体前屈数值");
        } else if (sex == 1 && grade == 1) {
            if (reachNum >= 24.9) {
                reachScore = 100;
            } else if (reachNum >= 23.1) {
                reachScore = 95;
            } else if (reachNum >= 21.3) {
                reachScore = 90;
            } else if (reachNum >= 19.5) {
                reachScore = 85;
            } else if (reachNum >= 17.7) {
                reachScore = 80;
            } else if (reachNum >= 16.3) {
                reachScore = 78;
            } else if (reachNum >= 14.9) {
                reachScore = 76;
            } else if (reachNum >= 13.5) {
                reachScore = 74;
            } else if (reachNum >= 12.1) {
                reachScore = 72;
            } else if (reachNum >= 10.7) {
                reachScore = 70;
            } else if (reachNum >= 9.3) {
                reachScore = 68;
            } else if (reachNum >= 7.9) {
                reachScore = 66;
            } else if (reachNum >= 6.5) {
                reachScore = 64;
            } else if (reachNum >= 5.1) {
                reachScore = 62;
            } else if (reachNum >= 3.7) {
                reachScore = 60;
            } else if (reachNum >= 2.7) {
                reachScore = 50;
            } else if (reachNum >= 1.7) {
                reachScore = 40;
            } else if (reachNum >= 0.7) {
                reachScore = 30;
            } else if (reachNum >= -0.3) {
                reachScore = 20;
            } else if (reachNum >= -1.3) {
                reachScore = 10;
            }
        } else if (sex == 1 && grade == 0) {
            if (reachNum >= 25.1) {
                reachScore = 100;
            } else if (reachNum >= 23.3) {
                reachScore = 95;
            } else if (reachNum >= 21.5) {
                reachScore = 90;
            } else if (reachNum >= 19.9) {
                reachScore = 85;
            } else if (reachNum >= 18.2) {
                reachScore = 80;
            } else if (reachNum >= 16.8) {
                reachScore = 78;
            } else if (reachNum >= 15.4) {
                reachScore = 76;
            } else if (reachNum >= 14) {
                reachScore = 74;
            } else if (reachNum >= 12.6) {
                reachScore = 72;
            } else if (reachNum >= 11.2) {
                reachScore = 70;
            } else if (reachNum >= 9.8) {
                reachScore = 68;
            } else if (reachNum >= 8.4) {
                reachScore = 66;
            } else if (reachNum >= 7) {
                reachScore = 64;
            } else if (reachNum >= 5.6) {
                reachScore = 62;
            } else if (reachNum >= 4.2) {
                reachScore = 60;
            } else if (reachNum >= 3.2) {
                reachScore = 50;
            } else if (reachNum >= 2.2) {
                reachScore = 40;
            } else if (reachNum >= 1.2) {
                reachScore = 30;
            } else if (reachNum >= 0.2) {
                reachScore = 20;
            } else if (reachNum >= -0.8) {
                reachScore = 10;
            }
        } else if (sex == 0 && grade == 1) {
            if (reachNum >= 27.1) {
                reachScore = 100;
            } else if (reachNum >= 25.3) {
                reachScore = 95;
            } else if (reachNum >= 23.5) {
                reachScore = 90;
            } else if (reachNum >= 21.7) {
                reachScore = 85;
            } else if (reachNum >= 19.9) {
                reachScore = 80;
            } else if (reachNum >= 18.5) {
                reachScore = 78;
            } else if (reachNum >= 17.1) {
                reachScore = 76;
            } else if (reachNum >= 15.7) {
                reachScore = 74;
            } else if (reachNum >= 14.3) {
                reachScore = 72;
            } else if (reachNum >= 12.9) {
                reachScore = 70;
            } else if (reachNum >= 11.5) {
                reachScore = 68;
            } else if (reachNum >= 10.1) {
                reachScore = 66;
            } else if (reachNum >= 8.7) {
                reachScore = 64;
            } else if (reachNum >= 7.3) {
                reachScore = 62;
            } else if (reachNum >= 5.9) {
                reachScore = 60;
            } else if (reachNum >= 4.9) {
                reachScore = 50;
            } else if (reachNum >= 3.9) {
                reachScore = 40;
            } else if (reachNum >= 2.9) {
                reachScore = 30;
            } else if (reachNum >= 1.9) {
                reachScore = 20;
            } else if (reachNum >= 0.9) {
                reachScore = 10;
            }
        } else if (sex == 0 && grade == 0) {
            if (reachNum >= 27.3) {
                reachScore = 100;
            } else if (reachNum >= 25.5) {
                reachScore = 95;
            } else if (reachNum >= 23.7) {
                reachScore = 90;
            } else if (reachNum >= 21.9) {
                reachScore = 85;
            } else if (reachNum >= 20.1) {
                reachScore = 80;
            } else if (reachNum >= 18.7) {
                reachScore = 78;
            } else if (reachNum >= 17.3) {
                reachScore = 76;
            } else if (reachNum >= 15.9) {
                reachScore = 74;
            } else if (reachNum >= 14.5) {
                reachScore = 72;
            } else if (reachNum >= 13.1) {
                reachScore = 70;
            } else if (reachNum >= 11.7) {
                reachScore = 68;
            } else if (reachNum >= 10.3) {
                reachScore = 66;
            } else if (reachNum >= 8.9) {
                reachScore = 64;
            } else if (reachNum >= 7.5) {
                reachScore = 62;
            } else if (reachNum >= 6.1) {
                reachScore = 60;
            } else if (reachNum >= 5.1) {
                reachScore = 50;
            } else if (reachNum >= 4.1) {
                reachScore = 40;
            } else if (reachNum >= 3.1) {
                reachScore = 30;
            } else if (reachNum >= 2.1) {
                reachScore = 20;
            } else if (reachNum >= 1.1) {
                reachScore = 10;
            }
        }
    }
    var jump = document.getElementsByName("jumps")[0].value;
    if (jump != "") {
        var jumpNum = parseFloat(jump);
        if (jumpNum < 50 || jumpNum > 400) {
            alert("请输入介于50~400的立定跳远数值");
        } else if (sex == 1 && grade == 1) {
            if (jumpNum >= 272) {
                jumpScore = 100;
            } else if (jumpNum >= 267) {
                jumpScore = 95;
            } else if (jumpNum >= 262) {
                jumpScore = 90;
            } else if (jumpNum >= 255) {
                jumpScore = 85;
            } else if (jumpNum >= 247) {
                jumpScore = 80;
            } else if (jumpNum >= 243) {
                jumpScore = 78;
            } else if (jumpNum >= 239) {
                jumpScore = 76;
            } else if (jumpNum >= 235) {
                jumpScore = 74;
            } else if (jumpNum >= 231) {
                jumpScore = 72;
            } else if (jumpNum >= 227) {
                jumpScore = 70;
            } else if (jumpNum >= 223) {
                jumpScore = 68;
            } else if (jumpNum >= 219) {
                jumpScore = 66;
            } else if (jumpNum >= 215) {
                jumpScore = 64;
            } else if (jumpNum >= 211) {
                jumpScore = 62;
            } else if (jumpNum >= 207) {
                jumpScore = 60;
            } else if (jumpNum >= 203) {
                jumpScore = 50;
            } else if (jumpNum >= 198) {
                jumpScore = 40;
            } else if (jumpNum >= 193) {
                jumpScore = 30;
            } else if (jumpNum >= 188) {
                jumpScore = 20;
            } else if (jumpNum >= 183) {
                jumpScore = 10;
            }
        } else if (sex == 1 && grade == 0) {
            if (jumpNum >= 275) {
                jumpScore = 100;
            } else if (jumpNum >= 270) {
                jumpScore = 95;
            } else if (jumpNum >= 265) {
                jumpScore = 90;
            } else if (jumpNum >= 258) {
                jumpScore = 85;
            } else if (jumpNum >= 250) {
                jumpScore = 80;
            } else if (jumpNum >= 246) {
                jumpScore = 78;
            } else if (jumpNum >= 242) {
                jumpScore = 76;
            } else if (jumpNum >= 238) {
                jumpScore = 74;
            } else if (jumpNum >= 234) {
                jumpScore = 72;
            } else if (jumpNum >= 230) {
                jumpScore = 70;
            } else if (jumpNum >= 226) {
                jumpScore = 68;
            } else if (jumpNum >= 222) {
                jumpScore = 66;
            } else if (jumpNum >= 218) {
                jumpScore = 64;
            } else if (jumpNum >= 214) {
                jumpScore = 62;
            } else if (jumpNum >= 210) {
                jumpScore = 60;
            } else if (jumpNum >= 205) {
                jumpScore = 50;
            } else if (jumpNum >= 200) {
                jumpScore = 40;
            } else if (jumpNum >= 195) {
                jumpScore = 30;
            } else if (jumpNum >= 190) {
                jumpScore = 20;
            } else if (jumpNum >= 185) {
                jumpScore = 10;
            }
        } else if (sex == 0 && grade == 1) {
            if (jumpNum >= 207) {
                jumpScore = 100;
            } else if (jumpNum >= 201) {
                jumpScore = 95;
            } else if (jumpNum >= 195) {
                jumpScore = 90;
            } else if (jumpNum >= 188) {
                jumpScore = 85;
            } else if (jumpNum >= 181) {
                jumpScore = 80;
            } else if (jumpNum >= 178) {
                jumpScore = 78;
            } else if (jumpNum >= 175) {
                jumpScore = 76;
            } else if (jumpNum >= 172) {
                jumpScore = 74;
            } else if (jumpNum >= 169) {
                jumpScore = 72;
            } else if (jumpNum >= 166) {
                jumpScore = 70;
            } else if (jumpNum >= 163) {
                jumpScore = 68;
            } else if (jumpNum >= 160) {
                jumpScore = 66;
            } else if (jumpNum >= 157) {
                jumpScore = 64;
            } else if (jumpNum >= 154) {
                jumpScore = 62;
            } else if (jumpNum >= 151) {
                jumpScore = 60;
            } else if (jumpNum >= 146) {
                jumpScore = 50;
            } else if (jumpNum >= 141) {
                jumpScore = 40;
            } else if (jumpNum >= 136) {
                jumpScore = 30;
            } else if (jumpNum >= 131) {
                jumpScore = 20;
            } else if (jumpNum >= 126) {
                jumpScore = 10;
            }
        } else if (sex == 0 && grade == 0) {
            if (jumpNum >= 208) {
                jumpScore = 100;
            } else if (jumpNum >= 202) {
                jumpScore = 95;
            } else if (jumpNum >= 196) {
                jumpScore = 90;
            } else if (jumpNum >= 189) {
                jumpScore = 85;
            } else if (jumpNum >= 182) {
                jumpScore = 80;
            } else if (jumpNum >= 179) {
                jumpScore = 78;
            } else if (jumpNum >= 176) {
                jumpScore = 76;
            } else if (jumpNum >= 173) {
                jumpScore = 74;
            } else if (jumpNum >= 170) {
                jumpScore = 72;
            } else if (jumpNum >= 167) {
                jumpScore = 70;
            } else if (jumpNum >= 164) {
                jumpScore = 68;
            } else if (jumpNum >= 161) {
                jumpScore = 66;
            } else if (jumpNum >= 158) {
                jumpScore = 64;
            } else if (jumpNum >= 155) {
                jumpScore = 62;
            } else if (jumpNum >= 152) {
                jumpScore = 60;
            } else if (jumpNum >= 147) {
                jumpScore = 50;
            } else if (jumpNum >= 142) {
                jumpScore = 40;
            } else if (jumpNum >= 137) {
                jumpScore = 30;
            } else if (jumpNum >= 132) {
                jumpScore = 20;
            } else if (jumpNum >= 127) {
                jumpScore = 10;
            }
        }
    }
    var shortrun = document.getElementsByName("shortruns")[0].value;
    if (shortrun != "") {
        var shortrunNum = parseFloat(shortrun);
        if (shortrunNum < 0 || shortrunNum > 50) {
            alert("请输入介于0~50的短跑数值");
        } else if (sex == 1 && grade == 1) {
            if (shortrunNum <= 6.7 && shortrunNum >= 2) {
                shortrunScore = 100;
            } else if (shortrunNum <= 6.8) {
                shortrunScore = 95;
            } else if (shortrunNum <= 6.9) {
                shortrunScore = 90;
            } else if (shortrunNum <= 7) {
                shortrunScore = 85;
            } else if (shortrunNum <= 7.1) {
                shortrunScore = 80;
            } else if (shortrunNum <= 7.3) {
                shortrunScore = 78;
            } else if (shortrunNum <= 7.5) {
                shortrunScore = 76;
            } else if (shortrunNum <= 7.7) {
                shortrunScore = 74;
            } else if (shortrunNum <= 7.9) {
                shortrunScore = 72;
            } else if (shortrunNum <= 8.1) {
                shortrunScore = 70;
            } else if (shortrunNum <= 8.3) {
                shortrunScore = 68;
            } else if (shortrunNum <= 8.5) {
                shortrunScore = 66;
            } else if (shortrunNum <= 8.7) {
                shortrunScore = 64;
            } else if (shortrunNum <= 8.9) {
                shortrunScore = 62;
            } else if (shortrunNum <= 9.1) {
                shortrunScore = 60;
            } else if (shortrunNum <= 9.3) {
                shortrunScore = 50;
            } else if (shortrunNum <= 9.5) {
                shortrunScore = 40;
            } else if (shortrunNum <= 9.7) {
                shortrunScore = 30;
            } else if (shortrunNum <= 9.9) {
                shortrunScore = 20;
            } else if (shortrunNum <= 10.1) {
                shortrunScore = 10;
            }
        } else if (sex == 1 && grade == 0) {
            if (shortrunNum <= 6.6 && shortrunNum >= 2) {
                shortrunScore = 100;
            } else if (shortrunNum <= 6.7) {
                shortrunScore = 95;
            } else if (shortrunNum <= 6.8) {
                shortrunScore = 90;
            } else if (shortrunNum <= 6.9) {
                shortrunScore = 85;
            } else if (shortrunNum <= 7) {
                shortrunScore = 80;
            } else if (shortrunNum <= 7.2) {
                shortrunScore = 78;
            } else if (shortrunNum <= 7.4) {
                shortrunScore = 76;
            } else if (shortrunNum <= 7.6) {
                shortrunScore = 74;
            } else if (shortrunNum <= 7.8) {
                shortrunScore = 72;
            } else if (shortrunNum <= 8) {
                shortrunScore = 70;
            } else if (shortrunNum <= 8.2) {
                shortrunScore = 68;
            } else if (shortrunNum <= 8.4) {
                shortrunScore = 66;
            } else if (shortrunNum <= 8.6) {
                shortrunScore = 64;
            } else if (shortrunNum <= 8.8) {
                shortrunScore = 62;
            } else if (shortrunNum <= 9) {
                shortrunScore = 60;
            } else if (shortrunNum <= 9.2) {
                shortrunScore = 50;
            } else if (shortrunNum <= 9.4) {
                shortrunScore = 40;
            } else if (shortrunNum <= 9.6) {
                shortrunScore = 30;
            } else if (shortrunNum <= 9.8) {
                shortrunScore = 20;
            } else if (shortrunNum <= 10) {
                shortrunScore = 10;
            }
        } else if (sex == 0 && grade == 1) {
            if (shortrunNum <= 7.5 && shortrunNum >= 2) {
                shortrunScore = 100;
            } else if (shortrunNum <= 7.6) {
                shortrunScore = 95;
            } else if (shortrunNum <= 7.7) {
                shortrunScore = 90;
            } else if (shortrunNum <= 8) {
                shortrunScore = 85;
            } else if (shortrunNum <= 8.3) {
                shortrunScore = 80;
            } else if (shortrunNum <= 8.5) {
                shortrunScore = 78;
            } else if (shortrunNum <= 8.7) {
                shortrunScore = 76;
            } else if (shortrunNum <= 8.9) {
                shortrunScore = 74;
            } else if (shortrunNum <= 9.1) {
                shortrunScore = 72;
            } else if (shortrunNum <= 9.3) {
                shortrunScore = 70;
            } else if (shortrunNum <= 9.5) {
                shortrunScore = 68;
            } else if (shortrunNum <= 9.7) {
                shortrunScore = 66;
            } else if (shortrunNum <= 9.9) {
                shortrunScore = 64;
            } else if (shortrunNum <= 10.1) {
                shortrunScore = 62;
            } else if (shortrunNum <= 10.3) {
                shortrunScore = 60;
            } else if (shortrunNum <= 10.5) {
                shortrunScore = 50;
            } else if (shortrunNum <= 10.7) {
                shortrunScore = 40;
            } else if (shortrunNum <= 10.9) {
                shortrunScore = 30;
            } else if (shortrunNum <= 11.1) {
                shortrunScore = 20;
            } else if (shortrunNum <= 11.3) {
                shortrunScore = 10;
            }
        } else if (sex == 0 && grade == 0) {
            if (shortrunNum <= 7.4 && shortrunNum >= 2) {
                shortrunScore = 100;
            } else if (shortrunNum <= 7.5) {
                shortrunScore = 95;
            } else if (shortrunNum <= 7.6) {
                shortrunScore = 90;
            } else if (shortrunNum <= 7.9) {
                shortrunScore = 85;
            } else if (shortrunNum <= 8.2) {
                shortrunScore = 80;
            } else if (shortrunNum <= 8.4) {
                shortrunScore = 78;
            } else if (shortrunNum <= 8.6) {
                shortrunScore = 76;
            } else if (shortrunNum <= 8.8) {
                shortrunScore = 74;
            } else if (shortrunNum <= 9) {
                shortrunScore = 72;
            } else if (shortrunNum <= 9.2) {
                shortrunScore = 70;
            } else if (shortrunNum <= 9.4) {
                shortrunScore = 68;
            } else if (shortrunNum <= 9.6) {
                shortrunScore = 66;
            } else if (shortrunNum <= 9.8) {
                shortrunScore = 64;
            } else if (shortrunNum <= 10) {
                shortrunScore = 62;
            } else if (shortrunNum <= 10.2) {
                shortrunScore = 60;
            } else if (shortrunNum <= 10.4) {
                shortrunScore = 50;
            } else if (shortrunNum <= 10.6) {
                shortrunScore = 40;
            } else if (shortrunNum <= 10.8) {
                shortrunScore = 30;
            } else if (shortrunNum <= 11) {
                shortrunScore = 20;
            } else if (shortrunNum <= 11.2) {
                shortrunScore = 10;
            }
        }
    }
    var run1000 = document.getElementsByName("1000runs")[0].value;
    var run800 = document.getElementsByName("800runs")[0].value;
    var differenceSecond = 0;
    if (sex == 1 && grade == 1 && run1000 != "") {
        var run1000Num = parseFloat(run1000);
        if (run1000Num < 2 || run1000Num > 10) {
            alert("请输入介于2~10的长跑数值");
        } else if (run1000Num <= 3.17 && run1000Num >= 2) {
            longrunScore = 100;
            if (run1000Num >= 3) {
                differenceSecond = (3.17 - run1000Num) * 100;
            } else if (run1000Num >= 2) {
                differenceSecond = (0.17 + 2.6 - run1000Num) * 100;
            }
            if (differenceSecond >= 4 && differenceSecond < 8) {
                additionScore += 1;
            } else if (differenceSecond >= 8 && differenceSecond < 12) {
                additionScore += 2;
            } else if (differenceSecond >= 12 && differenceSecond < 16) {
                additionScore += 3;
            } else if (differenceSecond >= 16 && differenceSecond < 20) {
                additionScore += 4;
            } else if (differenceSecond >= 20 && differenceSecond < 23) {
                additionScore += 5;
            } else if (differenceSecond >= 23 && differenceSecond < 26) {
                additionScore += 6;
            } else if (differenceSecond >= 26 && differenceSecond < 29) {
                additionScore += 7;
            } else if (differenceSecond >= 29 && differenceSecond < 32) {
                additionScore += 8;
            } else if (differenceSecond >= 32 && differenceSecond < 35) {
                additionScore += 9;
            } else if (differenceSecond >= 35) {
                additionScore += 10;
            }
        } else if (run1000Num <= 3.22) {
            longrunScore = 95;
        } else if (run1000Num <= 3.27) {
            longrunScore = 90;
        } else if (run1000Num <= 3.34) {
            longrunScore = 85;
        } else if (run1000Num <= 3.42) {
            longrunScore = 80;
        } else if (run1000Num <= 3.47) {
            longrunScore = 78;
        } else if (run1000Num <= 3.52) {
            longrunScore = 76;
        } else if (run1000Num <= 3.57) {
            longrunScore = 74;
        } else if (run1000Num <= 4.02) {
            longrunScore = 72;
        } else if (run1000Num <= 4.07) {
            longrunScore = 70;
        } else if (run1000Num <= 4.12) {
            longrunScore = 68;
        } else if (run1000Num <= 4.17) {
            longrunScore = 66;
        } else if (run1000Num <= 4.22) {
            longrunScore = 64;
        } else if (run1000Num <= 4.27) {
            longrunScore = 62;
        } else if (run1000Num <= 4.32) {
            longrunScore = 60;
        } else if (run1000Num <= 4.52) {
            longrunScore = 50;
        } else if (run1000Num <= 5.12) {
            longrunScore = 40;
        } else if (run1000Num <= 5.32) {
            longrunScore = 30;
        } else if (run1000Num <= 5.52) {
            longrunScore = 20;
        } else if (run1000Num <= 6.12) {
            longrunScore = 10;
        }
    } else if (sex == 1 && grade == 0 && run1000 != "") {
        var run1000Num2 = parseFloat(run1000);
        if (run1000Num2 < 2 || run1000Num2 > 10) {
            alert("请输入介于2~10的长跑数值");
        } else if (run1000Num2 <= 3.15 && run1000Num2 >= 2) {
            longrunScore = 100;
            if (run1000Num2 >= 3) {
                differenceSecond = (3.15 - run1000Num2) * 100;
            } else if (run1000Num2 >= 2) {
                differenceSecond = (0.15 + 2.6 - run1000Num2) * 100;
            }
            if (differenceSecond >= 4 && differenceSecond < 8) {
                additionScore += 1;
            } else if (differenceSecond >= 8 && differenceSecond < 12) {
                additionScore += 2;
            } else if (differenceSecond >= 12 && differenceSecond < 16) {
                additionScore += 3;
            } else if (differenceSecond >= 16 && differenceSecond < 20) {
                additionScore += 4;
            } else if (differenceSecond >= 20 && differenceSecond < 23) {
                additionScore += 5;
            } else if (differenceSecond >= 23 && differenceSecond < 26) {
                additionScore += 6;
            } else if (differenceSecond >= 26 && differenceSecond < 29) {
                additionScore += 7;
            } else if (differenceSecond >= 29 && differenceSecond < 32) {
                additionScore += 8;
            } else if (differenceSecond >= 32 && differenceSecond < 35) {
                additionScore += 9;
            } else if (differenceSecond >= 35) {
                additionScore += 10;
            }
        } else if (run1000Num2 <= 3.2) {
            longrunScore = 95;
        } else if (run1000Num2 <= 3.25) {
            longrunScore = 90;
        } else if (run1000Num2 <= 3.32) {
            longrunScore = 85;
        } else if (run1000Num2 <= 3.4) {
            longrunScore = 80;
        } else if (run1000Num2 <= 3.45) {
            longrunScore = 78;
        } else if (run1000Num2 <= 3.5) {
            longrunScore = 76;
        } else if (run1000Num2 <= 3.55) {
            longrunScore = 74;
        } else if (run1000Num2 <= 4.0) {
            longrunScore = 72;
        } else if (run1000Num2 <= 4.05) {
            longrunScore = 70;
        } else if (run1000Num2 <= 4.1) {
            longrunScore = 68;
        } else if (run1000Num2 <= 4.15) {
            longrunScore = 66;
        } else if (run1000Num2 <= 4.2) {
            longrunScore = 64;
        } else if (run1000Num2 <= 4.25) {
            longrunScore = 62;
        } else if (run1000Num2 <= 4.3) {
            longrunScore = 60;
        } else if (run1000Num2 <= 4.5) {
            longrunScore = 50;
        } else if (run1000Num2 <= 5.1) {
            longrunScore = 40;
        } else if (run1000Num2 <= 5.3) {
            longrunScore = 30;
        } else if (run1000Num2 <= 5.5) {
            longrunScore = 20;
        } else if (run1000Num2 <= 6.1) {
            longrunScore = 10;
        }
    } else if (sex == 0 && grade == 1 && run800 != "") {
        var run800Num = parseFloat(run800);
        if (run800Num < 2 || run800Num > 10) {
            alert("请输入介于2~10的长跑数值");
        } else if (run800Num <= 3.18 && run800Num >= 2) {
            longrunScore = 100;
            if (run800Num >= 3) {
                differenceSecond = (3.18 - run800Num) * 100;
            } else if (run800Num >= 2) {
                differenceSecond = (0.18 + 2.6 - run800Num) * 100;
            }
            if (differenceSecond >= 5 && differenceSecond < 10) {
                additionScore += 1;
            } else if (differenceSecond >= 10 && differenceSecond < 15) {
                additionScore += 2;
            } else if (differenceSecond >= 15 && differenceSecond < 20) {
                additionScore += 3;
            } else if (differenceSecond >= 20 && differenceSecond < 25) {
                additionScore += 4;
            } else if (differenceSecond >= 25 && differenceSecond < 30) {
                additionScore += 5;
            } else if (differenceSecond >= 30 && differenceSecond < 35) {
                additionScore += 6;
            } else if (differenceSecond >= 35 && differenceSecond < 40) {
                additionScore += 7;
            } else if (differenceSecond >= 40 && differenceSecond < 45) {
                additionScore += 8;
            } else if (differenceSecond >= 45 && differenceSecond < 50) {
                additionScore += 9;
            } else if (differenceSecond >= 50) {
                additionScore += 10;
            }
        } else if (run800Num <= 3.24) {
            longrunScore = 95;
        } else if (run800Num <= 3.3) {
            longrunScore = 90;
        } else if (run800Num <= 3.37) {
            longrunScore = 85;
        } else if (run800Num <= 3.44) {
            longrunScore = 80;
        } else if (run800Num <= 3.49) {
            longrunScore = 78;
        } else if (run800Num <= 3.54) {
            longrunScore = 76;
        } else if (run800Num <= 3.59) {
            longrunScore = 74;
        } else if (run800Num <= 4.04) {
            longrunScore = 72;
        } else if (run800Num <= 4.09) {
            longrunScore = 70;
        } else if (run800Num <= 4.14) {
            longrunScore = 68;
        } else if (run800Num <= 4.19) {
            longrunScore = 66;
        } else if (run800Num <= 4.24) {
            longrunScore = 64;
        } else if (run800Num <= 4.29) {
            longrunScore = 62;
        } else if (run800Num <= 4.34) {
            longrunScore = 60;
        } else if (run800Num <= 4.44) {
            longrunScore = 50;
        } else if (run800Num <= 4.54) {
            longrunScore = 40;
        } else if (run800Num <= 5.04) {
            longrunScore = 30;
        } else if (run800Num <= 5.14) {
            longrunScore = 20;
        } else if (run800Num <= 5.24) {
            longrunScore = 10;
        }
    } else if (sex == 0 && grade == 0 && run800 != "") {
        var run800Num2 = parseFloat(run800);
        if (run800Num2 < 2 || run800Num2 > 10) {
            alert("请输入介于2~10的长跑数值");
        } else if (run800Num2 <= 3.16 && run800Num2 >= 2) {
            longrunScore = 100;
            if (run800Num2 >= 3) {
                differenceSecond = (3.16 - run800Num2) * 100;
            } else if (run800Num2 >= 2) {
                differenceSecond = (0.16 + 2.6 - run800Num2) * 100;
            }
            if (differenceSecond >= 5 && differenceSecond < 10) {
                additionScore += 1;
            } else if (differenceSecond >= 10 && differenceSecond < 15) {
                additionScore += 2;
            } else if (differenceSecond >= 15 && differenceSecond < 20) {
                additionScore += 3;
            } else if (differenceSecond >= 20 && differenceSecond < 25) {
                additionScore += 4;
            } else if (differenceSecond >= 25 && differenceSecond < 30) {
                additionScore += 5;
            } else if (differenceSecond >= 30 && differenceSecond < 35) {
                additionScore += 6;
            } else if (differenceSecond >= 35 && differenceSecond < 40) {
                additionScore += 7;
            } else if (differenceSecond >= 40 && differenceSecond < 45) {
                additionScore += 8;
            } else if (differenceSecond >= 45 && differenceSecond < 50) {
                additionScore += 9;
            } else if (differenceSecond >= 50) {
                additionScore += 10;
            }
        } else if (run800Num2 <= 3.22) {
            longrunScore = 95;
        } else if (run800Num2 <= 3.28) {
            longrunScore = 90;
        } else if (run800Num2 <= 3.35) {
            longrunScore = 85;
        } else if (run800Num2 <= 4.42) {
            longrunScore = 80;
        } else if (run800Num2 <= 3.47) {
            longrunScore = 78;
        } else if (run800Num2 <= 3.52) {
            longrunScore = 76;
        } else if (run800Num2 <= 3.57) {
            longrunScore = 74;
        } else if (run800Num2 <= 4.02) {
            longrunScore = 72;
        } else if (run800Num2 <= 4.07) {
            longrunScore = 70;
        } else if (run800Num2 <= 4.12) {
            longrunScore = 68;
        } else if (run800Num2 <= 4.17) {
            longrunScore = 66;
        } else if (run800Num2 <= 4.22) {
            longrunScore = 64;
        } else if (run800Num2 <= 4.27) {
            longrunScore = 62;
        } else if (run800Num2 <= 4.32) {
            longrunScore = 60;
        } else if (run800Num2 <= 4.42) {
            longrunScore = 50;
        } else if (run800Num2 <= 4.52) {
            longrunScore = 40;
        } else if (run800Num2 <= 5.02) {
            longrunScore = 30;
        } else if (run800Num2 <= 5.12) {
            longrunScore = 20;
        } else if (run800Num2 <= 5.22) {
            longrunScore = 10;
        }
    }
    var pullup = document.getElementsByName("pullups")[0].value;
    var situp = document.getElementsByName("situps")[0].value;
    var differenceNum = 0;
    if (sex == 1 && grade == 1 && pullup != "") {
        var pullupNum = parseFloat(pullup);
        if (pullupNum < 0 || pullupNum > 100) {
            alert("请输入介于0~100的引体向上个数");
        } else if (pullupNum >= 19) {
            pullupsitupScore = 100;
            differenceNum = pullupNum - 19;
            if (differenceNum >= 1 && differenceNum < 2) {
                additionScore += 1;
            } else if (differenceNum >= 2 && differenceNum < 3) {
                additionScore += 2;
            } else if (differenceNum >= 3 && differenceNum < 4) {
                additionScore += 3;
            } else if (differenceNum >= 4 && differenceNum < 5) {
                additionScore += 4;
            } else if (differenceNum >= 5 && differenceNum < 6) {
                additionScore += 5;
            } else if (differenceNum >= 6 && differenceNum < 7) {
                additionScore += 6;
            } else if (differenceNum >= 7 && differenceNum < 8) {
                additionScore += 7;
            } else if (differenceNum >= 8 && differenceNum < 9) {
                additionScore += 8;
            } else if (differenceNum >= 9 && differenceNum < 10) {
                additionScore += 9;
            } else if (differenceNum >= 10) {
                additionScore += 10;
            }
        } else if (pullupNum >= 18) {
            pullupsitupScore = 95;
        } else if (pullupNum >= 17) {
            pullupsitupScore = 90;
        } else if (pullupNum >= 16) {
            pullupsitupScore = 85;
        } else if (pullupNum >= 15) {
            pullupsitupScore = 80;
        } else if (pullupNum >= 14) {
            pullupsitupScore = 76;
        } else if (pullupNum >= 13) {
            pullupsitupScore = 72;
        } else if (pullupNum >= 12) {
            pullupsitupScore = 68;
        } else if (pullupNum >= 11) {
            pullupsitupScore = 64;
        } else if (pullupNum >= 10) {
            pullupsitupScore = 60;
        } else if (pullupNum >= 9) {
            pullupsitupScore = 50;
        } else if (pullupNum >= 8) {
            pullupsitupScore = 40;
        } else if (pullupNum >= 7) {
            pullupsitupScore = 30;
        } else if (pullupNum >= 6) {
            pullupsitupScore = 20;
        } else if (pullupNum >= 1) {
            pullupsitupScore = 10;
        }
    } else if (sex == 1 && grade == 0 && pullup != "") {
        var pullupNum2 = parseFloat(pullup);
        if (pullupNum2 < 0 || pullupNum2 > 100) {
            alert("请输入介于0~100的引体向上个数");
        } else if (pullupNum2 >= 20) {
            pullupsitupScore = 100;
            differenceNum = pullupNum2 - 20;
            if (differenceNum >= 1 && differenceNum < 2) {
                additionScore += 1;
            } else if (differenceNum >= 2 && differenceNum < 3) {
                additionScore += 2;
            } else if (differenceNum >= 3 && differenceNum < 4) {
                additionScore += 3;
            } else if (differenceNum >= 4 && differenceNum < 5) {
                additionScore += 4;
            } else if (differenceNum >= 5 && differenceNum < 6) {
                additionScore += 5;
            } else if (differenceNum >= 6 && differenceNum < 7) {
                additionScore += 6;
            } else if (differenceNum >= 7 && differenceNum < 8) {
                additionScore += 7;
            } else if (differenceNum >= 8 && differenceNum < 9) {
                additionScore += 8;
            } else if (differenceNum >= 9 && differenceNum < 10) {
                additionScore += 9;
            } else if (differenceNum >= 10) {
                additionScore += 10;
            }
        } else if (pullupNum2 >= 19) {
            pullupsitupScore = 95;
        } else if (pullupNum2 >= 18) {
            pullupsitupScore = 90;
        } else if (pullupNum2 >= 17) {
            pullupsitupScore = 85;
        } else if (pullupNum2 >= 16) {
            pullupsitupScore = 80;
        } else if (pullupNum2 >= 15) {
            pullupsitupScore = 76;
        } else if (pullupNum2 >= 14) {
            pullupsitupScore = 72;
        } else if (pullupNum2 >= 13) {
            pullupsitupScore = 68;
        } else if (pullupNum2 >= 12) {
            pullupsitupScore = 64;
        } else if (pullupNum2 >= 11) {
            pullupsitupScore = 60;
        } else if (pullupNum2 >= 10) {
            pullupsitupScore = 50;
        } else if (pullupNum2 >= 9) {
            pullupsitupScore = 40;
        } else if (pullupNum2 >= 8) {
            pullupsitupScore = 30;
        } else if (pullupNum2 >= 7) {
            pullupsitupScore = 20;
        } else if (pullupNum2 >= 2) {
            pullupsitupScore = 10;
        }
    } else if (sex == 0 && grade == 1 && situp != "") {
        var situpNum = parseFloat(situp);
        if (situpNum < 0 || situpNum > 100) {
            alert("请输入介于0~100的仰卧起坐个数");
        } else if (situpNum >= 56) {
            pullupsitupScore = 100;
            differenceNum = situpNum - 56;
            if (differenceNum >= 2 && differenceNum < 4) {
                additionScore += 1;
            } else if (differenceNum >= 4 && differenceNum < 6) {
                additionScore += 2;
            } else if (differenceNum >= 6 && differenceNum < 7) {
                additionScore += 3;
            } else if (differenceNum >= 7 && differenceNum < 8) {
                additionScore += 4;
            } else if (differenceNum >= 8 && differenceNum < 9) {
                additionScore += 5;
            } else if (differenceNum >= 9 && differenceNum < 10) {
                additionScore += 6;
            } else if (differenceNum >= 10 && differenceNum < 11) {
                additionScore += 7;
            } else if (differenceNum >= 11 && differenceNum < 12) {
                additionScore += 8;
            } else if (differenceNum >= 12 && differenceNum < 13) {
                additionScore += 9;
            } else if (differenceNum >= 13) {
                additionScore += 10;
            }
        } else if (situpNum >= 54) {
            pullupsitupScore = 95;
        } else if (situpNum >= 52) {
            pullupsitupScore = 90;
        } else if (situpNum >= 49) {
            pullupsitupScore = 85;
        } else if (situpNum >= 46) {
            pullupsitupScore = 80;
        } else if (situpNum >= 44) {
            pullupsitupScore = 78;
        } else if (situpNum >= 42) {
            pullupsitupScore = 76;
        } else if (situpNum >= 40) {
            pullupsitupScore = 74;
        } else if (situpNum >= 38) {
            pullupsitupScore = 72;
        } else if (situpNum >= 36) {
            pullupsitupScore = 70;
        } else if (situpNum >= 34) {
            pullupsitupScore = 68;
        } else if (situpNum >= 32) {
            pullupsitupScore = 66;
        } else if (situpNum >= 30) {
            pullupsitupScore = 64;
        } else if (situpNum >= 28) {
            pullupsitupScore = 62;
        } else if (situpNum >= 26) {
            pullupsitupScore = 60;
        } else if (situpNum >= 24) {
            pullupsitupScore = 50;
        } else if (situpNum >= 22) {
            pullupsitupScore = 40;
        } else if (situpNum >= 20) {
            pullupsitupScore = 30;
        } else if (situpNum >= 18) {
            pullupsitupScore = 20;
        } else if (situpNum >= 16) {
            pullupsitupScore = 10;
        }
    } else if (sex == 0 && grade == 0 && situp != "") {
        var situpNum2 = parseFloat(situp);
        if (situpNum2 < 0 || situpNum2 > 100) {
            alert("请输入介于0~100的仰卧起坐个数");
        } else if (situpNum2 >= 57) {
            pullupsitupScore = 100;
            differenceNum = situpNum2 - 57;
            if (differenceNum >= 2 && differenceNum < 4) {
                additionScore += 1;
            } else if (differenceNum >= 4 && differenceNum < 6) {
                additionScore += 2;
            } else if (differenceNum >= 6 && differenceNum < 7) {
                additionScore += 3;
            } else if (differenceNum >= 7 && differenceNum < 8) {
                additionScore += 4;
            } else if (differenceNum >= 8 && differenceNum < 9) {
                additionScore += 5;
            } else if (differenceNum >= 9 && differenceNum < 10) {
                additionScore += 6;
            } else if (differenceNum >= 10 && differenceNum < 11) {
                additionScore += 7;
            } else if (differenceNum >= 11 && differenceNum < 12) {
                additionScore += 8;
            } else if (differenceNum >= 12 && differenceNum < 13) {
                additionScore += 9;
            } else if (differenceNum >= 13) {
                additionScore += 10;
            }
        } else if (situpNum2 >= 55) {
            pullupsitupScore = 95;
        } else if (situpNum2 >= 53) {
            pullupsitupScore = 90;
        } else if (situpNum2 >= 50) {
            pullupsitupScore = 85;
        } else if (situpNum2 >= 47) {
            pullupsitupScore = 80;
        } else if (situpNum2 >= 45) {
            pullupsitupScore = 78;
        } else if (situpNum2 >= 43) {
            pullupsitupScore = 76;
        } else if (situpNum2 >= 41) {
            pullupsitupScore = 74;
        } else if (situpNum2 >= 39) {
            pullupsitupScore = 72;
        } else if (situpNum2 >= 37) {
            pullupsitupScore = 70;
        } else if (situpNum2 >= 35) {
            pullupsitupScore = 68;
        } else if (situpNum2 >= 33) {
            pullupsitupScore = 66;
        } else if (situpNum2 >= 31) {
            pullupsitupScore = 64;
        } else if (situpNum2 >= 29) {
            pullupsitupScore = 62;
        } else if (situpNum2 >= 27) {
            pullupsitupScore = 60;
        } else if (situpNum2 >= 25) {
            pullupsitupScore = 50;
        } else if (situpNum2 >= 23) {
            pullupsitupScore = 40;
        } else if (situpNum2 >= 21) {
            pullupsitupScore = 30;
        } else if (situpNum2 >= 19) {
            pullupsitupScore = 20;
        } else if (situpNum2 >= 17) {
            pullupsitupScore = 10;
        }
    }
    score = (
        BMIScore * 0.15 +
        breathScore * 0.15 +
        reachScore * 0.1 +
        jumpScore * 0.1 +
        shortrunScore * 0.2 +
        longrunScore * 0.2 +
        pullupsitupScore * 0.1 +
        additionScore
    ).toFixed(1);
    result.textContent = score;
    additionEl.textContent = additionScore;
    totalLevelEl.textContent = scoreToLevel(parseFloat(score));
    const bmiValid = BMI.value !== "";
    setRow("bmi", bmiValid ? BMI.value : "", BMIScore, bmiValid);
    const breathValid = breath !== "";
    setRow("breath", breathValid ? breath : "", breathScore, breathValid);
    const sprintValid = shortrun !== "";
    setRow("sprint", sprintValid ? shortrun : "", shortrunScore, sprintValid);
    const reachValid = reach !== "";
    setRow("sitreach", reachValid ? reach : "", reachScore, reachValid);
    const jumpValid = jump !== "";
    setRow("longjump", jumpValid ? jump : "", jumpScore, jumpValid);
    if (sex === 1) {
        const strengthValid = pullup !== "";
        setRow(
            "strength",
            strengthValid ? pullup : "",
            pullupsitupScore,
            strengthValid
        );
        const enduranceValid = run1000 !== "";
        setRow(
            "endurance",
            enduranceValid ? run1000 : "",
            longrunScore,
            enduranceValid
        );
    } else {
        const strengthValid = situp !== "";
        setRow(
            "strength",
            strengthValid ? situp : "",
            pullupsitupScore,
            strengthValid
        );
        const enduranceValid = run800 !== "";
        setRow(
            "endurance",
            enduranceValid ? run800 : "",
            longrunScore,
            enduranceValid
        );
    }
};
document.onkeydown = function (e) {
    if (e.keyCode == 13) {
        document.getElementById("compute").click();
    }
};
setupPersistence();
