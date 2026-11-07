import locales from "./locale-registry.mjs";
import ar from "./messages/ar.mjs";
import de from "./messages/de.mjs";
import en from "./messages/en.mjs";
import es from "./messages/es.mjs";
import fa from "./messages/fa.mjs";
import fr from "./messages/fr.mjs";
import it from "./messages/it.mjs";
import ko from "./messages/ko.mjs";
import ru from "./messages/ru.mjs";

const translations = { ar, "de-DE":de, "en-US":en, "es-ES":es, "fa-IR":fa, "fr-FR":fr, "it-IT":it, "ko-KR":ko, "ru-RU":ru };
const defaultLocale = locales[0].code;
const localeStorageKey = "elyora-institute.ui-locale";
const isUiLocale = (value) => locales.some(({code}) => code === value);
const languageNames = new Map();

function savedLocale() {
  try {
    const value = localStorage.getItem(localeStorageKey);
    if (isUiLocale(value)) return value;
  } catch {
    // The preview also works when persistent storage is disabled.
  }
  return defaultLocale;
}

const views = [
  {id:"student",number:"01",image:"./assets/student-studio.svg",capsule:"studentCapsule",features:["featureStudent1","featureStudent2","featureStudent3"]},
  {id:"teacher",number:"02",image:"./assets/teacher-atelier.svg",capsule:"teacherCapsule",features:["featureTeacher1","featureTeacher2","featureTeacher3"]},
  {id:"classroom",number:"03",image:"./assets/live-classroom.svg",capsule:"classroomCapsule",features:["featureClass1","featureClass2","featureClass3"]},
  {id:"command",number:"04",image:"./assets/command-center.svg",capsule:"commandCapsule",features:["featureCommand1","featureCommand2","featureCommand3"]}
];
const state = { uiLocale:savedLocale(), view:"campus", filter:"all", catalog:null };
const $ = (q) => document.querySelector(q);
const escapeHtml = (v) => String(v).replace(/[&<>"']/g, (c) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
})[c]);
const t = (key) => translations[state.uiLocale][key];

function localizedLanguageName(language) {
  if (state.uiLocale === "fa-IR") return language.displayNameFa;
  if (state.uiLocale === "en-US") return language.displayNameEn;
  if (!languageNames.has(state.uiLocale) && typeof Intl.DisplayNames === "function") {
    languageNames.set(state.uiLocale, new Intl.DisplayNames(state.uiLocale, {
      type:"language", fallback:"none", languageDisplay:"standard"
    }));
  }
  return languageNames.get(state.uiLocale)?.of(language.code) ?? language.autonym;
}

function sectionHeading(kicker,title,description) {
  return '<div class="section-bar"><div><span class="section-kicker">' + escapeHtml(t(kicker)) +
    '</span><h2 class="section-title">' + escapeHtml(t(title)) +
    '</h2><p class="section-caption">' + escapeHtml(t(description)) + '</p></div></div>';
}
function hero(view) {
  const isCampus = view === "campus";
  const room = views.find((v) => v.id === view);
  const image = isCampus ? "./assets/live-classroom.svg" : room.image;
  const heading = isCampus ? ["heroTitle","heroAccent"] : [view+"Title",view+"Accent"];
  const desc = isCampus ? "heroDescription" : view+"Description";
  const subtitle = isCampus ? "instituteLabel" : "roomBadge";
  const firstButton = isCampus
    ? '<button type="button" class="button-primary" data-view="student">' + escapeHtml(t("enterStudio")) + ' <span aria-hidden="true">↗</span></button>'
    : '<button type="button" class="button-primary" data-action="preview">' + escapeHtml(t("roomStatus")) + '</button>';
  return '<section class="hero" aria-label="' + escapeHtml(t(isCampus ? "campus" : view)) + '">' +
    '<div class="hero-copy"><span class="eyebrow">' + escapeHtml(t(subtitle)) + '</span>' +
    '<h1>' + escapeHtml(t(heading[0])) + ' <em>' + escapeHtml(t(heading[1])) + '</em></h1>' +
    '<p>' + escapeHtml(t(desc)) + '</p><div class="hero-actions">' + firstButton +
    '<button type="button" class="button-secondary" data-view="' + (isCampus ? "classroom" : "campus") + '">' +
    escapeHtml(t(isCampus ? "exploreRooms" : "home")) + '</button></div></div>' +
    '<div class="hero-image"><img src="' + image + '" alt="' + escapeHtml(t(isCampus ? "classroom" : view)) +
    '" loading="eager"></div></section>';
}
function rooms() {
  return '<div class="space-grid">' + views.map((v) =>
    '<article class="space-card"><div class="space-thumb"><img alt="' + escapeHtml(t(v.id)) +
    '" loading="lazy" src="' + v.image + '"></div><div class="space-card-body">' +
    '<span class="card-overline">' + escapeHtml(t(v.capsule)) + '</span><h3>' + escapeHtml(t(v.id)) +
    '</h3><p>' + escapeHtml(t(v.id+"Description")) + '</p>' +
    '<button type="button" class="card-link" data-view="' + v.id + '">' +
    escapeHtml(t("openPreview")) + ' <span aria-hidden="true">↗</span></button></div></article>'
  ).join("") + '</div>';
}
function languageCard(language) {
  const name = localizedLanguageName(language);
  const direction = language.direction === "rtl" ? "rtl" : "ltr";
  return '<article class="language-card" data-program="' + escapeHtml(language.code) + '">' +
    '<div class="language-monogram" aria-hidden="true" dir="ltr">' +
    escapeHtml(language.code.slice(0,2).toUpperCase()) +
    '</div><div class="language-body"><strong lang="' + escapeHtml(language.code) + '"><bdi dir="' +
    direction + '">' + escapeHtml(language.autonym) + '</bdi></strong><small dir="auto">' +
    escapeHtml(name) + '</small></div>' +
    '<span class="language-status">' + escapeHtml(t("planned")) + '</span></article>';
}
function languageCards() {
  const {catalog, filter} = state;
  const displayed = filter === "all" ? catalog.languages : catalog.languages.filter((language) => language.code === filter);
  return displayed.map(languageCard).join("");
}
function languageSection() {
  const select = '<label class="section-control"><span>' + escapeHtml(t("targetLanguage")) +
    '</span><select id="program-language">' +
    '<option value="all">' + escapeHtml(t("allLanguages")) + '</option>' +
    state.catalog.languages.map((language) =>
      '<option value="' + escapeHtml(language.code) + '"' + (state.filter === language.code ? " selected" : "") + '>' +
      escapeHtml(localizedLanguageName(language)) + '</option>'
    ).join("") + '</select></label>';
  const heading = '<div class="section-bar"><div><span class="section-kicker">' + escapeHtml(t("languagesKicker")) +
    '</span><h2 class="section-title">' + escapeHtml(t("languagesTitle")) + '</h2>' +
    '<p class="section-caption">' + escapeHtml(t("languagesDescription")) +
    '</p></div>' + select + '</div>';
  return heading + '<div class="language-grid">' + languageCards() + '</div>';
}
function features(keys) {
  const icons = ["✦","◷","♧"];
  return '<div class="feature-grid">' + keys.map((key,i) =>
    '<article class="feature-card"><div class="feature-icon" aria-hidden="true">' + icons[i%3] +
    '</div><h3>' + escapeHtml(t(key)) + '</h3><p>' + escapeHtml(t(key+"Body")) + '</p></article>'
  ).join("") + '</div>';
}
function notice() {
  return '<div class="notice-strip" role="note"><strong aria-hidden="true">ⓘ</strong><div><strong>' +
    escapeHtml(t("noticeTitle")) + '</strong><div>' + escapeHtml(t("previewNotice")) + '</div></div></div>';
}
function renderMain() {
  if (!state.catalog) return;
  const isCampus = state.view === "campus";
  const room = views.find((v) => v.id === state.view);
  const featureList = isCampus ? ["feature1","feature2","feature3"] : room.features;
  let body = hero(state.view);
  if (isCampus) {
    body += sectionHeading("spacesKicker","spacesTitle","spacesDescription");
    body += rooms();
    body += languageSection();
    body += sectionHeading("strengthsKicker","strengthsTitle","strengthsDescription");
    body += features(featureList);
  } else {
    body += '<div class="section-bar"><div><span class="section-kicker">' + escapeHtml(t("roomBadge")) +
      '</span><h2 class="section-title">' + escapeHtml(t("roomFocus")) + '</h2>' +
      '<p class="section-caption">' + escapeHtml(t("programContext")) + '</p></div></div>';
    body += features(featureList);
    body += sectionHeading("spacesKicker","roomPlans","spacesDescription");
    body += rooms();
    body += languageSection();
  }
  body += notice();
  $("#main").innerHTML = body;
  document.querySelectorAll(".nav-item[data-view]").forEach((button) => {
    const selected = button.dataset.view === state.view;
    button.classList.toggle("active", selected);
    if (selected) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}
function updateViewTitle() {
  $("#current-location").textContent = t(state.view);
  document.title = t(state.view) + " · " + t("previewShort");
}

function localizeFrame() {
  const locale = locales.find(({code}) => code === state.uiLocale);
  document.documentElement.lang = locale.code;
  document.documentElement.dir = locale.direction;
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nLabel));
  });
  $('meta[name="description"]').content = t("pageDescription");
  $("#ui-locale").value = state.uiLocale;
  updateViewTitle();
}

function initLocalePicker() {
  const picker = $("#ui-locale");
  picker.replaceChildren(...locales.map(({code, direction, autonym}) => {
    const option = new Option(autonym, code);
    option.lang = code;
    option.dir = direction;
    return option;
  }));
}
function openPreviewNotice() {
  const dialog = $("#preview-dialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open","");
}
document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-view]");
  if (nav && (nav.dataset.view === "campus" || views.some((view) => view.id === nav.dataset.view))) {
    state.view = nav.dataset.view;
    updateViewTitle();
    renderMain();
    $("#main").focus({ preventScroll:true });
    window.scrollTo({ top:0, behavior:"auto" });
    return;
  }
  if (event.target.closest('[data-action="preview"]')) openPreviewNotice();
});
document.addEventListener("change", (event) => {
  if (event.target.id === "ui-locale" && isUiLocale(event.target.value)) {
    state.uiLocale = event.target.value;
    try {
      localStorage.setItem(localeStorageKey, state.uiLocale);
    } catch {
      // The current view can still use the selected language.
    }
    localizeFrame();
    renderMain();
  }
  if (event.target.id === "program-language" && state.catalog) {
    const choice = event.target.value;
    if (choice === "all" || state.catalog.languages.some((l) => l.code === choice)) {
      state.filter = choice;
      $(".language-grid").innerHTML = languageCards();
    }
  }
});
$("#dialog-close").addEventListener("click", () => $("#preview-dialog").close());

async function boot() {
  initLocalePicker();
  localizeFrame();
  try {
    const response = await fetch("./api/demo/languages.json", {cache:"no-store"});
    if (!response.ok) throw Error("Catalog request refused");
    const catalog = await response.json();
    if (catalog.status !== "PROVISIONAL_DEMO_SEED" || !Array.isArray(catalog.languages) || catalog.languages.length === 0) {
      throw Error("Unapproved or invalid preview catalog");
    }
    state.catalog = catalog;
  } catch {
    const error = $("#main [role=status]");
    error.setAttribute("role", "alert");
    error.dataset.i18n = "catalogUnavailable";
    error.textContent = t("catalogUnavailable");
    return;
  }
  renderMain();
}
boot();
