/* ==========================================================================
   MODULO: Informazioni (js/informazioni.js) - Aggiunta Tabella Codici SDI
   ========================================================================== */
(function() {
    'use strict';

    // Lista statica dei codici SDI estratta dal PDF
    const sdiData = [
        { codice: "TO4ZH3R", provider: "2C SOLUTION" },
        { codice: "HUE516M", provider: "AGYO" },
        { codice: "L8WH30T", provider: "AGYO (TEAMSYSTEM)" },
        { codice: "KUPCRMI", provider: "AGYO (TEAMSYSTEM)" },
        { codice: "C1QQYZR", provider: "ALTO TREVIGIANO SERVIZI" },
        { codice: "C3UCNRB", provider: "ALTO TREVIGIANO SERVIZI" },
        { codice: "C4AL1U8", provider: "ALTO TREVIGIANO SERVIZI" },
        { codice: "PAXCCYU", provider: "ANDXOR" },
        { codice: "WP7SE2Q", provider: "ARCHIVIA.ONLINE" },
        { codice: "3ZJY534", provider: "ARCHIVIUM SRL" },
        { codice: "4157204", provider: "ARCHIVIUM SRL" },
        { codice: "5KQRP7D", provider: "ARCHIVIUM SRL" },
        { codice: "G9H7JRW", provider: "ARTHUR INFORMATICA" },
        { codice: "G4AI1U8", provider: "ARTHUR INFORMATICA" },
        { codice: "KRRH6B9", provider: "ARUBA" },
        { codice: "A4707H7", provider: "ARXIVAR" },
        { codice: "DXEBYTP", provider: "ASSIST INFORMATICA SRL" },
        { codice: "M62SGNV", provider: "AYGO TEAMSYSTEM" },
        { codice: "8CQGKGJ", provider: "B CONSOLE" },
        { codice: "PXQYICS", provider: "B2B EASY" },
        { codice: "3000002", provider: "BANCA IFIS" },
        { codice: "4000002", provider: "BANCA IFIS" },
        { codice: "X2PH38J", provider: "BLUENEXT" },
        { codice: "BA6ET11", provider: "BUFFETTI" },
        { codice: "7HE8RN5", provider: "CENTRO SOFTWARE" },
        { codice: "SU9YNJA", provider: "CGN BY RDV NETWORK" },
        { codice: "6RB0OU9", provider: "CIA" },
        { codice: "7G984OP", provider: "CIA" },
        { codice: "7J6LNAP", provider: "CIA" },
        { codice: "94QLT54", provider: "CIA" },
        { codice: "9MTMAR3", provider: "CIA" },
        { codice: "HHBNB2R", provider: "CLAPPS" },
        { codice: "6JXPS2J", provider: "CLOUDFINANCE" },
        { codice: "WNK4HCP", provider: "COFFEWEB" },
        { codice: "5W4A8J1", provider: "COLDIRETTI" },
        { codice: "SYOORSD", provider: "COLDIRETTI" },
        { codice: "B66HAMY", provider: "CONFARTIGIANATO" },
        { codice: "AU7YEU4", provider: "CONSORZIO CIAT" },
        { codice: "MZO2AOU", provider: "CREDEMTEL (GRUPPO BANCA CREDEM)" },
        { codice: "G1XGCBG", provider: "DANISOFT" },
        { codice: "G9HZIRW", provider: "DATALOG ITALIA SRL" },
        { codice: "T9K4ZHO", provider: "DATEV KOINOS" },
        { codice: "T9U85V9", provider: "DATEV KOINOS" },
        { codice: "USA39RA", provider: "DAY RISTOSERVICE" },
        { codice: "URSWIEX", provider: "DIGITHERA" },
        { codice: "J6URRTW", provider: "DOCEASY" },
        { codice: "JX8OYTO", provider: "DOCEASY" },
        { codice: "2LCMINU", provider: "EAV SRL" },
        { codice: "HHBD9AK", provider: "EDIEL" },
        { codice: "8KI8156", provider: "EDIGEST" },
        { codice: "UNIOW8G", provider: "EDIGEST" },
        { codice: "EH1R83N", provider: "EDISOFTWARE SRL" },
        { codice: "MJEGRSK", provider: "EDOK SRL" },
        { codice: "G7Q6SPJ", provider: "ENTAKSI" },
        { codice: "39QMOPD", provider: "ENTE AUTONOMO VOLTURNO" },
        { codice: "E2VWRNU", provider: "EXTREME SOFTWARE" },
        { codice: "XWJKNZD", provider: "FABER SYSTEM" },
        { codice: "WHP7LTE", provider: "FATTAPP CLOUD SERVICES" },
        { codice: "OCCDHSV", provider: "FATTURA 1 CLICK" },
        { codice: "N92GLON", provider: "FATTURA ELETTRONICA APP" },
        { codice: "5RUO82D", provider: "FATTURA PA BY PASSEPARTOUT" },
        { codice: "PUR1DAR", provider: "FATTURA PER TUTTI" },
        { codice: "SZLUBAI", provider: "FATTURA24" },
        { codice: "WY7PJ6K", provider: "FATTURAONCLICK.IT" },
        { codice: "WH2KO8I", provider: "FATTURAPAPERTUTTI" },
        { codice: "M5UXCR1", provider: "FATTURE IN CLOUD BY TEAMSYSTEM" },
        { codice: "QULXG4S", provider: "FATTUREGB" },
        { codice: "RRG48KY", provider: "FATTUREGB" },
        { codice: "ROINDUX", provider: "FATTUTTO" },
        { codice: "RN5Y3P1", provider: "FEDERFARMA" },
        { codice: "RYRNPOU", provider: "FERSERVIZI" },
        { codice: "UE2LXTM", provider: "FINSON" },
        { codice: "UJJIIX9", provider: "FINSON" },
        { codice: "6EWHWLT", provider: "FTPA" },
        { codice: "N3HJJJI", provider: "GESPAC SRL" },
        { codice: "5P3UNVR", provider: "GRUPPO CMT" },
        { codice: "SN4CSRI", provider: "GRUPPO SEGESTA" },
        { codice: "MTD8HRW", provider: "GSP" },
        { codice: "PPX7BLB", provider: "IDEA SOFTWARE" },
        { codice: "NKNH5UQ", provider: "IDOCTORS" },
        { codice: "NVXARUR", provider: "IDOCTORS" },
        { codice: "OB9MX5S", provider: "IDOCTORS" },
        { codice: "ORIEHPO", provider: "IDOCTORS" },
        { codice: "P41UPYH", provider: "IDOCTORS" },
        { codice: "16VXTJA", provider: "IEO INFORMATICA" },
        { codice: "MI10YNU", provider: "IFIN" },
        { codice: "66OZKW1", provider: "INFOCAMERE" },
        { codice: "XL13LG4", provider: "INFOCERT" },
        { codice: "KOROACV", provider: "INFORMITALIA SRL" },
        { codice: "K1L1030", provider: "INFORMITALIA SRL" },
        { codice: "RWB54P8", provider: "INTESA SAN PAOLO" },
        { codice: "RXMENAR", provider: "INTESA SAN PAOLO" },
        { codice: "YRXHCLN", provider: "INTOUCH SRL" },
        { codice: "ZE7RBOG", provider: "INTOUCH SRL" },
        { codice: "ZS100U1", provider: "INTOUCH SRL" },
        { codice: "MSUXCR1", provider: "K LINK SOLUTIONS" },
        { codice: "N9KM26R", provider: "KALYOS" },
        { codice: "TRS30H9", provider: "KSG" },
        { codice: "XMXAUP4", provider: "LAPAM" },
        { codice: "10ZKECO", provider: "LIBERO SIFATTURA" },
        { codice: "ACTKBBZ", provider: "LICON BY IX" },
        { codice: "AGZS6TU", provider: "LICON BY IX" },
        { codice: "ARBTDQ3", provider: "LICON BY IX" },
        { codice: "4ADX8V9", provider: "MEDIAINX" },
        { codice: "38P86EY", provider: "MEDIATICA" },
        { codice: "MRCC2DY", provider: "MEMORY SRL" },
        { codice: "P43TKPP", provider: "METEL" },
        { codice: "W4KYJ8V", provider: "METODO" },
        { codice: "SU1UTOG", provider: "MISTER SOFTWARE" },
        { codice: "AO3AEUZ", provider: "MISTRAL DI BLUSYS" },
        { codice: "TULURSB", provider: "MODULA3" },
        { codice: "TV195KG", provider: "MODULA3" },
        { codice: "U21NEXA", provider: "MODULA3" },
        { codice: "JHBM40P", provider: "MULTIDIALOGO" },
        { codice: "GR2P7ZP", provider: "MULTIWIRE" },
        { codice: "1347Y6N", provider: "MYFISCALCLOUD" },
        { codice: "H348Q01", provider: "MYSOND" },
        { codice: "QD4YHQC", provider: "NET4MARKET" },
        { codice: "1N74KED", provider: "NTS DIGITAL HUB" },
        { codice: "X46AXNR", provider: "OK COPY ITALIA SRL" },
        { codice: "08L2VB7", provider: "OLIVETTI" },
        { codice: "OLCJ82K", provider: "OLIVETTI" },
        { codice: "XIT6IPS", provider: "OLSA INFORMATICA" },
        { codice: "QYISEC3", provider: "OMICRON SISTEMI" },
        { codice: "KBRM7PS", provider: "ONDATA CLOUD" },
        { codice: "DUDUOGE", provider: "ORISLINE" },
        { codice: "RNMN7NC", provider: "PEGASOGEST" },
        { codice: "QLDR2VY", provider: "PROFARMA" },
        { codice: "QLDRZVY", provider: "PROFARMA" },
        { codice: "KISRCTG", provider: "QUICKMASTRO" },
        { codice: "OHYG9HP", provider: "RAI" },
        { codice: "RGBDW7A", provider: "RAI RADIOTELEVISIONE ITALIANA" },
        { codice: "RLGKQUU", provider: "RANOCCHI DIGITAL HUB" },
        { codice: "SNT102H", provider: "READY PRO" },
        { codice: "SR77132", provider: "READY PRO" },
        { codice: "CC2G1TV", provider: "REGINVOICE" },
        { codice: "PZIJH2V", provider: "REGISTER" },
        { codice: "Q15GJOZ", provider: "REGISTER" },
        { codice: "QDZCM9N", provider: "REGISTER" },
        { codice: "SAOPL6Q", provider: "SATANET" },
        { codice: "ZCK6XHR", provider: "SAVINO SOLUTION SRL" },
        { codice: "P62QHVQ", provider: "SEAC" },
        { codice: "P83CKOC", provider: "SEAC" },
        { codice: "PR4AG6C", provider: "SEAC" },
        { codice: "G9YK3BM", provider: "SEDICO SERVIZI" },
        { codice: "SKUA8Y6", provider: "SERINF" },
        { codice: "USAL8PV", provider: "SISTEMI" },
        { codice: "RTVLCR1", provider: "SIWEB" },
        { codice: "CEORGIG", provider: "SKYNET" },
        { codice: "OKDMVIB", provider: "SMART VET" },
        { codice: "04CC85E", provider: "SOFTA SRL" },
        { codice: "ITH9EQH", provider: "SOFTWARE GESTLEADER - LEADER TECHNOLOGY DI ING. BARTOLO ANTONIO" },
        { codice: "BMQCL4W", provider: "SOFTWARE SEMPLICE" },
        { codice: "3RB98ZT", provider: "STUDIOFARMA SRL" },
        { codice: "ISHDUAE", provider: "SUBITOFATTURA" },
        { codice: "0G6TBBX", provider: "TECH EDGE" },
        { codice: "OZCQR4A", provider: "TECH EDGE" },
        { codice: "HQSIB42", provider: "TOKEM S.R.L." },
        { codice: "TPICRCA", provider: "TRUST INVOICE" },
        { codice: "TRTSWMZ", provider: "TRUST TECHNOLOGIES" },
        { codice: "LX4UQQ5", provider: "TRUST TECHNOLOGY" },
        { codice: "2R4GTO8", provider: "UFFICIO TRIBUTARIO DI SAN MARINO" },
        { codice: "E06UCUD", provider: "UNIMATICA" },
        { codice: "7035UR5", provider: "UNIONE AGRICOLTORI E COLTIVATORI DIRETTI SUDTIROLESI" },
        { codice: "TT0B2J8", provider: "UNO ERP" },
        { codice: "MSITOJA", provider: "VAR GROUP" },
        { codice: "MSOROP", provider: "VAR GROUP" },
        { codice: "3G3OPYL", provider: "VAR GROUP SPA" },
        { codice: "TO4ZHR3", provider: "WEBCLIENT" },
        { codice: "W7YVJK9", provider: "WOLTERS KLUWER" },
        { codice: "W840XLE", provider: "WOLTERS KLUWER" },
        { codice: "KGVVJ2H", provider: "YOUDOX" },
        { codice: "WTHLGAQ", provider: "YOUINVOICE GRUPPO BPM" },
        { codice: "JC7P1DW", provider: "ZEROGESTIONALE.IT" },
        { codice: "SUBM70N", provider: "ZUCCHETTI" }
    ];

    const InfoModule = {
        localState: {
            searchQuery: '',
            currentPage: 1,
            itemsPerPage: 10,
            sdiSearchQuery: '',
            sdiCurrentPage: 1,
            sdiItemsPerPage: 10
        },

        init() {
            if (!App.state.data.stazioni) App.state.data.stazioni = [];
        },

        render() {
            const container = document.getElementById('informazioni-container');
            if (!container) return;

            if (!document.getElementById('info-layout')) {
                container.innerHTML = this.getLayoutHTML();
                lucide.createIcons();
                this.attachListeners();
            }
            this.updateView();
            this.restoreLayout();
            this.initDragAndDrop();
        },

        updateView() {
            this.renderTable();
            this.renderSDITable();
        },

        initDragAndDrop() {
            const save = () => this.saveLayout();

            // 1. Macro-Sezioni (Verticale)
            const sections = document.getElementById('info-sections-container');
            if (sections) {
                new Sortable(sections, {
                    animation: 150,
                    handle: '.section-handle', // Trascina dalle intestazioni delle card principali
                    ghostClass: 'sortable-ghost',
                    onSort: save
                });
            }

            // 2. Card Collegamenti (Griglia interna)
            const links = document.getElementById('info-links-grid');
            if (links) {
                new Sortable(links, {
                    animation: 150,
                    handle: '.card-handle', // Trascina dalle intestazioni delle 3 card
                    ghostClass: 'sortable-ghost',
                    onSort: save
                });
            }
        },

        saveLayout() {
            try {
                const getIds = (cid) => Array.from(document.getElementById(cid)?.children || []).map(el => el.id).filter(id => id);
                const layout = {
                    sections: getIds('info-sections-container'),
                    links: getIds('info-links-grid')
                };
                // La nuova card 'sec-sdi' è dentro 'info-sections-container',
                // quindi viene salvata automaticamente da questa logica.
                localStorage.setItem('Polaris_info_layout_v2', JSON.stringify(layout));
            } catch (e) { console.warn('Salvataggio layout info bloccato:', e); }
        },

        restoreLayout() {
            try {
                const saved = localStorage.getItem('Polaris_info_layout_v2');
                if (!saved) return;
                const layout = JSON.parse(saved);
                const restore = (cid, ids) => {
                    const container = document.getElementById(cid);
                    if (!container || !ids) return;
                    ids.forEach(id => { const el = document.getElementById(id); if (el) container.appendChild(el); });
                };
                restore('info-sections-container', layout.sections);
                restore('info-links-grid', layout.links);
            } catch (e) { console.warn("Errore ripristino layout info:", e); }
        },

        getLayoutHTML() {
            return `
                <div id="info-layout" class="flex flex-col gap-6 animate-fade-in">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Informazioni Utili</h2>
                    </div>

                    <div id="info-sections-container" class="flex flex-col gap-8">
                        
                        <div id="sec-links" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden draggable-card">
                            <div class="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 section-handle cursor-move" title="Sposta sezione">
                                <i data-lucide="link-2" class="w-5 h-5 mr-3 text-gray-700 dark:text-gray-300"></i>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Collegamenti Rapidi</h3>
                            </div>
                            <div id="info-links-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start p-6">
                                
                                <div id="card-gestione" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-handle cursor-move">
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Gestione e Servizi</h3>
                                        <div class="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full">
                                            <i data-lucide="briefcase" class="w-5 h-5"></i>
                                        </div>
                                    </div>
                                    <div class="p-6">
                                        <ul class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                            <li><a href="https://enivirtualstation.4ts.it/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Virtualstation</a></li>
                                            <li><a href="https://myenistation.eni.com/content/myenistation/it/ordini.html" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Ordini Carburanti</a></li>
                                            <li><a href="https://myenistation.eni.com/content/myenistation/it/contabilita.html" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Contabilità</a></li>
                                            <li><a href="https://diviseeni.audes.com/it/customer/account/login" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Audes</a></li>
                                            <li><a href="https://cardsmanager.it/Accounting/Login" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Fattura 1click</a></li>
                                            <li><a href="https://fatturazioneelettronica.aruba.it/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Fattura (Aruba)</a></li>
                                        </ul>
                                    </div>
                                </div>

                                <div id="card-collegamenti" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-handle cursor-move">
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Collegamenti Utili</h3>
                                        <div class="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full">
                                            <i data-lucide="link" class="w-5 h-5"></i>
                                        </div>
                                    </div>
                                    <div class="p-6">
                                        <ul class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                            <li><a href="https://www.unicredit.it/it/privati.html" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Unicredit</a></li>
                                            <li><a href="https://www.bccroma.it/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> BCC Roma</a></li>
                                            <li><a href="https://business.nexi.it/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Nexi Business</a></li>
                                            <li><a href="https://iampe.adm.gov.it/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Agenzia Dogane</a></li>
                                            <li><a href="http://gestori.cipreg.org/" target="_blank" class="flex items-center hover:text-primary-600 dark:hover:text-primary-500"><i data-lucide="external-link" class="w-4 h-4 mr-2"></i> Cipreg (Gestori)</a></li>
                                        </ul>
                                    </div>
                                </div>

                                <div id="card-assistenza" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 draggable-card overflow-hidden">
                                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 card-handle cursor-move">
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Assistenza</h3>
                                        <div class="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-full">
                                            <i data-lucide="phone-call" class="w-5 h-5"></i>
                                        </div>
                                    </div>
                                    <div class="p-6">
                                        <ul class="space-y-3 text-sm">
                                            <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Enilive Assistenza</span><a href="tel:800797979" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">800 79 79 79</a></li>
                                            <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Portale Gestori</span><a href="tel:800960970" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">800 960 970</a></li>
                                            <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">POS Unicredit</span><a href="tel:800900280" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">800 900 280</a></li>
                                            <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">POS Enilive</span><a href="tel:800999720" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">800 999 720</a></li>
                                            <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Deposito ENI</span><a href="tel:0691820084" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">06 9182 0084</a></li>
                                            <li class="flex justify-between"><span class="text-gray-500 dark:text-gray-400">Fortech</span><a href="tel:800216756" class="font-medium text-primary-600 dark:text-primary-500 hover:underline">800 216 756</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="sec-sdi" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden draggable-card">
                            <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 section-handle cursor-move">
                                <div class="flex items-center" title="Sposta intera sezione">
                                    <i data-lucide="file-key-2" class="w-5 h-5 mr-3 text-gray-700 dark:text-gray-300"></i>
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Elenco Codici SDI</h3>
                                </div>
                                <div class="relative no-drag" onmousedown="event.stopPropagation()">
                                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><i data-lucide="search" class="w-4 h-4 text-gray-500 dark:text-gray-400"></i></div>
                                    <input type="search" id="sdi-search" class="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Cerca codice o provider..." value="${this.localState.sdiSearchQuery}">
                                </div>
                            </div>
                            <div class="p-6">
                                <div class="overflow-x-auto">
                                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr><th class="px-4 py-3">Codice Destinatario</th><th class="px-4 py-3">Provider</th></tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700" id="sdi-tbody"></tbody>
                                    </table>
                                </div>
                                <div id="sdi-pagination"></div>
                            </div>
                        </div>
                        <div id="sec-table" class="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden draggable-card">
                            <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 section-handle cursor-move">
                                <div class="flex items-center" title="Sposta intera sezione">
                                    <i data-lucide="map-pin" class="w-5 h-5 mr-3 text-gray-700 dark:text-gray-300"></i>
                                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Impianti ENILIVE Roma</h3>
                                </div>
                                <div class="flex flex-wrap items-center gap-3 no-drag" onmousedown="event.stopPropagation()">
                                    <div class="relative">
                                        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><i data-lucide="search" class="w-4 h-4 text-gray-500 dark:text-gray-400"></i></div>
                                        <input type="search" id="stazioni-search" class="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Cerca impianto..." value="${this.localState.searchQuery}">
                                    </div>
                                    <div class="flex gap-2">
                                        <button id="btn-import-stazioni" class="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-3 py-2.5 flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700" title="Importa CSV"><i data-lucide="upload" class="size-4"></i></button>
                                        <button id="btn-export-stazioni" class="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-3 py-2.5 flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700" title="Esporta CSV"><i data-lucide="download" class="size-4"></i></button>
                                        <button id="btn-print-stazioni" class="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-3 py-2.5 flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700" title="Stampa"><i data-lucide="printer" class="size-4"></i></button>
                                        <button id="btn-del-all-stazioni" class="text-red-600 bg-white border border-red-200 hover:bg-red-50 font-medium rounded-lg text-sm px-3 py-2.5 flex items-center dark:bg-gray-800 dark:text-red-500 dark:border-red-900 dark:hover:bg-gray-700" title="Elimina Tutto"><i data-lucide="trash-2" class="size-4"></i></button>
                                    </div>
                                </div>
                            </div>
                            <div class="p-6">
                                <div class="overflow-x-auto">
                                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr><th class="px-4 py-3">PV</th><th class="px-4 py-3">Ragione Sociale</th><th class="px-4 py-3">Indirizzo</th><th class="px-4 py-3">Telefono</th></tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700" id="stazioni-tbody"></tbody>
                                    </table>
                                </div>
                                <div id="stazioni-pagination"></div>
                            </div>
                        </div>

                    </div>
                </div>`;
        },

        renderTable() {
            const tbody = document.getElementById('stazioni-tbody');
            if (!tbody) return;
            
            const allStazioni = this.getFilteredStazioni();
            const totalPages = Math.ceil(allStazioni.length / this.localState.itemsPerPage);

            if (this.localState.currentPage > totalPages && totalPages > 0) this.localState.currentPage = totalPages;
            if (this.localState.currentPage < 1) this.localState.currentPage = 1;

            const start = (this.localState.currentPage - 1) * this.localState.itemsPerPage;
            const pageStazioni = allStazioni.slice(start, start + this.localState.itemsPerPage);

            this.renderPaginationControls(totalPages);

            if (!pageStazioni.length) {
                tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">Nessun impianto trovato. Importa un file CSV.</td></tr>';
            } else {
                tbody.innerHTML = pageStazioni.map(s => `
                    <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${s.pv || '-'}</td>
                        <td class="px-4 py-3">${s.ragioneSociale || '-'}</td>
                        <td class="px-4 py-3">${s.indirizzo || '-'}</td>
                        <td class="px-4 py-3">${s.telefono || '-'}</td>
                    </tr>`).join('');
            }
        },

        renderPaginationControls(totalPages) {
            const container = document.getElementById('stazioni-pagination');
            if (!container) return;
            if (totalPages <= 1) { container.innerHTML = ''; return; }
            
            const curr = this.localState.currentPage;
            container.innerHTML = `
                <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Pagina <span class="font-semibold text-gray-900 dark:text-white">${curr}</span> di <span class="font-semibold text-gray-900 dark:text-white">${totalPages}</span></span>
                    <div class="inline-flex rounded-md shadow-sm">
                        <button id="staz-prev-page" class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" ${curr===1?'disabled':''} title="Pagina precedente"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
                        <button id="staz-next-page" class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" ${curr===totalPages?'disabled':''} title="Pagina successiva"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
                    </div>
                </div>`;
            
            document.getElementById('staz-prev-page')?.addEventListener('click', () => { this.localState.currentPage--; this.renderTable(); });
            document.getElementById('staz-next-page')?.addEventListener('click', () => { this.localState.currentPage++; this.renderTable(); });
            lucide.createIcons();
        },

        getFilteredStazioni() {
            let s = [...App.state.data.stazioni];
            const q = this.localState.searchQuery.toLowerCase();
            if (q) s = s.filter(x => (x.pv||'').toLowerCase().includes(q) || (x.ragioneSociale||'').toLowerCase().includes(q) || (x.indirizzo||'').toLowerCase().includes(q));
            return s.sort((a, b) => (parseInt(a.pv)||0) - (parseInt(b.pv)||0));
        },
        
        renderSDITable() {
            const tbody = document.getElementById('sdi-tbody');
            if (!tbody) return;
            
            const allSDI = this.getFilteredSDI();
            const totalPages = Math.ceil(allSDI.length / this.localState.sdiItemsPerPage);

            if (this.localState.sdiCurrentPage > totalPages && totalPages > 0) this.localState.sdiCurrentPage = totalPages;
            if (this.localState.sdiCurrentPage < 1) this.localState.sdiCurrentPage = 1;

            const start = (this.localState.sdiCurrentPage - 1) * this.localState.sdiItemsPerPage;
            const pageSDI = allSDI.slice(start, start + this.localState.sdiItemsPerPage);

            this.renderSDIPagination(totalPages);

            if (!pageSDI.length) {
                tbody.innerHTML = '<tr><td colspan="2" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">Nessun codice trovato.</td></tr>';
            } else {
                tbody.innerHTML = pageSDI.map(s => `
                    <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">${s.codice}</td>
                        <td class="px-4 py-3">${s.provider}</td>
                    </tr>`).join('');
            }
        },

        renderSDIPagination(totalPages) {
            const container = document.getElementById('sdi-pagination');
            if (!container) return;
            if (totalPages <= 1) { container.innerHTML = ''; return; }
            
            const curr = this.localState.sdiCurrentPage;
            container.innerHTML = `
                <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Pagina <span class="font-semibold text-gray-900 dark:text-white">${curr}</span> di <span class="font-semibold text-gray-900 dark:text-white">${totalPages}</span></span>
                    <div class="inline-flex rounded-md shadow-sm">
                        <button id="sdi-prev-page" class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" ${curr===1?'disabled':''} title="Pagina precedente"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
                        <button id="sdi-next-page" class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-primary-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50" ${curr===totalPages?'disabled':''} title="Pagina successiva"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
                    </div>
                </div>`;
            
            document.getElementById('sdi-prev-page')?.addEventListener('click', () => { this.localState.sdiCurrentPage--; this.renderSDITable(); });
            document.getElementById('sdi-next-page')?.addEventListener('click', () => { this.localState.sdiCurrentPage++; this.renderSDITable(); });
            lucide.createIcons();
        },

        getFilteredSDI() {
            let s = [...sdiData];
            const q = this.localState.sdiSearchQuery.toLowerCase();
            if (q) s = s.filter(x => (x.codice||'').toLowerCase().includes(q) || (x.provider||'').toLowerCase().includes(q));
            return s.sort((a, b) => a.provider.localeCompare(b.provider));
        },

        importCSV(e) {
            const f = e.target.files[0]; if (!f) return;
            const r = new FileReader();
            r.onload = (ev) => {
                const lines = ev.target.result.trim().split(/\r?\n/);
                if (lines.length < 1) return alert("File vuoto.");
                if (lines[0].toLowerCase().includes('pv')) lines.shift();
                const delim = lines[0].includes(';') ? ';' : ',';
                const imported = [];
                lines.forEach(l => {
                    if (!l.trim()) return;
                    const cols = []; let cur = ''; let inQ = false;
                    for (let i = 0; i < l.length; i++) {
                        if (l[i] === '"') { if (inQ && l[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
                        else if (l[i] === delim && !inQ) { cols.push(cur.trim()); cur = ''; }
                        else cur += l[i];
                    }
                    cols.push(cur.trim());
                    if (cols.length >= 2) imported.push({ pv: cols[0], ragioneSociale: cols[1], indirizzo: cols[2]||'', telefono: cols[3]||'' });
                });
                if (imported.length) { App.state.data.stazioni = imported; App.saveToStorage(); this.renderTable(); alert(`${imported.length} impianti importati.`); }
                else alert("Nessun dato valido trovato.");
            };
            r.readAsText(f); e.target.value = '';
        },

        exportCSV() {
            const stazioni = App.state.data.stazioni;
            if (!stazioni || stazioni.length === 0) return alert("Nessun impianto da esportare.");
            const csv = ['PV,Ragione Sociale,Indirizzo,Telefono', ...stazioni.map(s => `"${s.pv||''}","${s.ragioneSociale||''}","${s.indirizzo||''}","${s.telefono||''}"`)].join('\n');
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'})); a.download = `impianti_eni_roma_${new Date().toISOString().slice(0,10)}.csv`; a.click();
        },

        deleteAll() {
            if (confirm('Eliminare tutti gli impianti dalla lista?')) {
                App.state.data.stazioni = []; App.saveToStorage(); this.renderTable();
            }
        },

        // --- MODIFICA PRINT: INSERITO MONTSERRAT ---
        printList() {
            const w = window.open('', '_blank');
            w.document.write(`<html><head><title>Impianti ENILIVE Roma</title><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet"><style>body{font-family:'Montserrat',sans-serif;padding:20px;font-weight:300}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f2f2f2;font-weight:600}</style></head><body><h2>Impianti ENILIVE Roma</h2><table><thead><tr><th>PV</th><th>Ragione Sociale</th><th>Indirizzo</th><th>Telefono</th></tr></thead><tbody>${this.getFilteredStazioni().map(s => `<tr><td>${s.pv}</td><td>${s.ragioneSociale}</td><td>${s.indirizzo}</td><td>${s.telefono}</td></tr>`).join('')}</tbody></table></body></html>`);
            w.document.close(); w.print();
        },

        attachListeners() {
            document.getElementById('stazioni-search').oninput = (e) => { this.localState.searchQuery = e.target.value; this.localState.currentPage = 1; this.renderTable(); };
            document.getElementById('btn-import-stazioni').onclick = () => document.getElementById('import-stazioni-input').click();
            document.getElementById('btn-export-stazioni').onclick = () => this.exportCSV();
            document.getElementById('btn-print-stazioni').onclick = () => this.printList();
            document.getElementById('btn-del-all-stazioni').onclick = () => this.deleteAll();
            document.getElementById('sdi-search').oninput = (e) => { this.localState.sdiSearchQuery = e.target.value; this.localState.sdiCurrentPage = 1; this.renderSDITable(); };

            let fileInput = document.getElementById('import-stazioni-input');
            if (!fileInput) {
                fileInput = document.createElement('input');
                fileInput.type = 'file'; fileInput.id = 'import-stazioni-input'; fileInput.accept = '.csv'; fileInput.className = 'hidden';
                document.body.appendChild(fileInput);
            }
            fileInput.onchange = (e) => this.importCSV(e);
        }
    };

    if(window.App) App.registerModule('informazioni', InfoModule); 
    else document.addEventListener('app:ready', () => App.registerModule('informazioni', InfoModule));
})();