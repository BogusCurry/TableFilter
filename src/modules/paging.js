import {Feature} from '../feature';
import {createElm, createOpt, createText, elm, removeElm} from '../dom';
import {isArray, isFn, isNull} from '../types';
import {addEvt, keyCode, removeEvt} from '../event';
import {INPUT, SELECT, NONE, ENTER_KEY} from '../const';

export class Paging extends Feature {

    /**
     * Pagination component
     * @param {Object} tf TableFilter instance
     */
    constructor(tf) {
        super(tf, 'paging');

        // Configuration object
        var f = this.config;

        //css class for paging buttons (previous,next,etc.)
        this.btnPageCssClass = f.paging_btn_css_class || 'pgInp';
        //stores paging select element
        this.pagingSlc = null;
        //results per page select element
        this.resultsPerPageSlc = null;
        //id of container element
        this.pagingTgtId = f.paging_target_id || null;
        //defines table paging length
        this.pagingLength = !isNaN(f.paging_length) ? f.paging_length : 10;
        //id of container element
        this.resultsPerPageTgtId = f.results_per_page_target_id || null;
        //css class for paging select element
        this.pgSlcCssClass = f.paging_slc_css_class || 'pgSlc';
        //css class for paging input element
        this.pgInpCssClass = f.paging_inp_css_class || 'pgNbInp';
        //stores results per page text and values
        this.resultsPerPage = f.results_per_page || null;
        //enables/disables results per page drop-down
        this.hasResultsPerPage = isArray(this.resultsPerPage);
        //defines css class for results per page select
        this.resultsSlcCssClass = f.results_slc_css_class || 'rspg';
        //css class for label preceding results per page select
        this.resultsSpanCssClass = f.results_span_css_class || 'rspgSpan';
        //1st row index of current page
        this.startPagingRow = 0;
        //total nb of pages
        this.nbPages = 0;
        //current page nb
        this.currentPageNb = 1;
        //defines next page button text
        this.btnNextPageText = f.btn_next_page_text || '>';
        //defines previous page button text
        this.btnPrevPageText = f.btn_prev_page_text || '<';
        //defines last page button text
        this.btnLastPageText = f.btn_last_page_text || '>|';
        //defines first page button text
        this.btnFirstPageText = f.btn_first_page_text || '|<';
        //defines next page button html
        this.btnNextPageHtml = f.btn_next_page_html ||
            (!tf.enableIcons ? null :
                '<input type="button" value="" class="' + this.btnPageCssClass +
                ' nextPage" title="Next page" />');
        //defines previous page button html
        this.btnPrevPageHtml = f.btn_prev_page_html ||
            (!tf.enableIcons ? null :
                '<input type="button" value="" class="' + this.btnPageCssClass +
                ' previousPage" title="Previous page" />');
        //defines last page button html
        this.btnFirstPageHtml = f.btn_first_page_html ||
            (!tf.enableIcons ? null :
                '<input type="button" value="" class="' + this.btnPageCssClass +
                ' firstPage" title="First page" />');
        //defines previous page button html
        this.btnLastPageHtml = f.btn_last_page_html ||
            (!tf.enableIcons ? null :
                '<input type="button" value="" class="' + this.btnPageCssClass +
                ' lastPage" title="Last page" />');
        //defines text preceeding page selector drop-down
        this.pageText = f.page_text || ' Page ';
        //defines text after page selector drop-down
        this.ofText = f.of_text || ' of ';
        //css class for span containing tot nb of pages
        this.nbPgSpanCssClass = f.nb_pages_css_class || 'nbpg';
        //enables/disables paging buttons
        this.hasPagingBtns = f.paging_btns === false ? false : true;
        //defines previous page button html
        this.pageSelectorType = f.page_selector_type || SELECT;
        //calls function before page is changed
        this.onBeforeChangePage = isFn(f.on_before_change_page) ?
            f.on_before_change_page : null;
        //calls function before page is changed
        this.onAfterChangePage = isFn(f.on_after_change_page) ?
            f.on_after_change_page : null;

        //pages select
        this.prfxSlcPages = 'slcPages_';
        //results per page select
        this.prfxSlcResults = 'slcResults_';
        //label preciding results per page select
        this.prfxSlcResultsTxt = 'slcResultsTxt_';
        //span containing next page button
        this.prfxBtnNextSpan = 'btnNextSpan_';
        //span containing previous page button
        this.prfxBtnPrevSpan = 'btnPrevSpan_';
        //span containing last page button
        this.prfxBtnLastSpan = 'btnLastSpan_';
        //span containing first page button
        this.prfxBtnFirstSpan = 'btnFirstSpan_';
        //next button
        this.prfxBtnNext = 'btnNext_';
        //previous button
        this.prfxBtnPrev = 'btnPrev_';
        //last button
        this.prfxBtnLast = 'btnLast_';
        //first button
        this.prfxBtnFirst = 'btnFirst_';
        //span for tot nb pages
        this.prfxPgSpan = 'pgspan_';
        //span preceding pages select (contains 'Page')
        this.prfxPgBeforeSpan = 'pgbeforespan_';
        //span following pages select (contains ' of ')
        this.prfxPgAfterSpan = 'pgafterspan_';

        var start_row = tf.refRow;
        var nrows = tf.getRowsNb(true);
        //calculates page nb
        this.nbPages = Math.ceil((nrows - start_row) / this.pagingLength);

        //Paging elements events
        var o = this;
        // Paging DOM events
        this.evt = {
            slcIndex() {
                return (o.pageSelectorType === SELECT) ?
                    o.pagingSlc.options.selectedIndex :
                    parseInt(o.pagingSlc.value, 10) - 1;
            },
            nbOpts() {
                return (o.pageSelectorType === SELECT) ?
                    parseInt(o.pagingSlc.options.length, 10) - 1 :
                    (o.nbPages - 1);
            },
            next() {
                var nextIndex = o.evt.slcIndex() < o.evt.nbOpts() ?
                    o.evt.slcIndex() + 1 : 0;
                o.changePage(nextIndex);
            },
            prev() {
                var prevIndex = o.evt.slcIndex() > 0 ?
                    o.evt.slcIndex() - 1 : o.evt.nbOpts();
                o.changePage(prevIndex);
            },
            last() {
                o.changePage(o.evt.nbOpts());
            },
            first() {
                o.changePage(0);
            },
            _detectKey(e) {
                var key = keyCode(e);
                if (key === ENTER_KEY) {
                    if (tf.sorted) {
                        tf.filter();
                        o.changePage(o.evt.slcIndex());
                    } else {
                        o.changePage();
                    }
                    this.blur();
                }
            },
            slcPagesChange: null,
            nextEvt: null,
            prevEvt: null,
            lastEvt: null,
            firstEvt: null
        };
    }

    /**
     * Initialize DOM elements
     */
    init() {
        var slcPages;
        var tf = this.tf;
        var evt = this.evt;

        if (this.initialized) {
            return;
        }

        // Check resultsPerPage is in expected format and initialise the
        // results per page component
        if (this.hasResultsPerPage) {
            if (this.resultsPerPage.length < 2) {
                this.hasResultsPerPage = false;
            } else {
                this.pagingLength = this.resultsPerPage[1][0];
                this.setResultsPerPage();
            }
        }

        evt.slcPagesChange = (event) => {
            var slc = event.target;
            this.changePage(slc.selectedIndex);
        };

        // Paging drop-down list selector
        if (this.pageSelectorType === SELECT) {
            slcPages = createElm(SELECT, ['id', this.prfxSlcPages + tf.id]);
            slcPages.className = this.pgSlcCssClass;
            addEvt(slcPages, 'change', evt.slcPagesChange);
        }

        // Paging input selector
        if (this.pageSelectorType === INPUT) {
            slcPages = createElm(INPUT,
                ['id', this.prfxSlcPages + tf.id],
                ['value', this.currentPageNb]
            );
            slcPages.className = this.pgInpCssClass;
            addEvt(slcPages, 'keypress', evt._detectKey);
        }

        // btns containers
        var btnNextSpan = createElm(
            'span', ['id', this.prfxBtnNextSpan + tf.id]);
        var btnPrevSpan = createElm(
            'span', ['id', this.prfxBtnPrevSpan + tf.id]);
        var btnLastSpan = createElm(
            'span', ['id', this.prfxBtnLastSpan + tf.id]);
        var btnFirstSpan = createElm(
            'span', ['id', this.prfxBtnFirstSpan + tf.id]);

        if (this.hasPagingBtns) {
            // Next button
            if (!this.btnNextPageHtml) {
                var btn_next = createElm(INPUT,
                    ['id', this.prfxBtnNext + tf.id],
                    ['type', 'button'],
                    ['value', this.btnNextPageText],
                    ['title', 'Next']
                );
                btn_next.className = this.btnPageCssClass;
                addEvt(btn_next, 'click', evt.next);
                btnNextSpan.appendChild(btn_next);
            } else {
                btnNextSpan.innerHTML = this.btnNextPageHtml;
                addEvt(btnNextSpan, 'click', evt.next);
            }
            // Previous button
            if (!this.btnPrevPageHtml) {
                var btn_prev = createElm(INPUT,
                    ['id', this.prfxBtnPrev + tf.id],
                    ['type', 'button'],
                    ['value', this.btnPrevPageText],
                    ['title', 'Previous']
                );
                btn_prev.className = this.btnPageCssClass;
                addEvt(btn_prev, 'click', evt.prev);
                btnPrevSpan.appendChild(btn_prev);
            } else {
                btnPrevSpan.innerHTML = this.btnPrevPageHtml;
                addEvt(btnPrevSpan, 'click', evt.prev);
            }
            // Last button
            if (!this.btnLastPageHtml) {
                var btn_last = createElm(INPUT,
                    ['id', this.prfxBtnLast + tf.id],
                    ['type', 'button'],
                    ['value', this.btnLastPageText],
                    ['title', 'Last']
                );
                btn_last.className = this.btnPageCssClass;
                addEvt(btn_last, 'click', evt.last);
                btnLastSpan.appendChild(btn_last);
            } else {
                btnLastSpan.innerHTML = this.btnLastPageHtml;
                addEvt(btnLastSpan, 'click', evt.last);
            }
            // First button
            if (!this.btnFirstPageHtml) {
                var btn_first = createElm(INPUT,
                    ['id', this.prfxBtnFirst + tf.id],
                    ['type', 'button'],
                    ['value', this.btnFirstPageText],
                    ['title', 'First']
                );
                btn_first.className = this.btnPageCssClass;
                addEvt(btn_first, 'click', evt.first);
                btnFirstSpan.appendChild(btn_first);
            } else {
                btnFirstSpan.innerHTML = this.btnFirstPageHtml;
                addEvt(btnFirstSpan, 'click', evt.first);
            }
        }

        // paging elements (buttons+drop-down list) are added to defined element
        if (!this.pagingTgtId) {
            tf.setToolbar();
        }
        var targetEl = !this.pagingTgtId ? tf.mDiv : elm(this.pagingTgtId);
        targetEl.appendChild(btnFirstSpan);
        targetEl.appendChild(btnPrevSpan);

        var pgBeforeSpan = createElm(
            'span', ['id', this.prfxPgBeforeSpan + tf.id]);
        pgBeforeSpan.appendChild(createText(this.pageText));
        pgBeforeSpan.className = this.nbPgSpanCssClass;
        targetEl.appendChild(pgBeforeSpan);
        targetEl.appendChild(slcPages);
        var pgAfterSpan = createElm(
            'span', ['id', this.prfxPgAfterSpan + tf.id]);
        pgAfterSpan.appendChild(createText(this.ofText));
        pgAfterSpan.className = this.nbPgSpanCssClass;
        targetEl.appendChild(pgAfterSpan);
        var pgspan = createElm('span', ['id', this.prfxPgSpan + tf.id]);
        pgspan.className = this.nbPgSpanCssClass;
        pgspan.appendChild(createText(' ' + this.nbPages + ' '));
        targetEl.appendChild(pgspan);
        targetEl.appendChild(btnNextSpan);
        targetEl.appendChild(btnLastSpan);
        this.pagingSlc = elm(this.prfxSlcPages + tf.id);

        this.setPagingInfo();

        if (!tf.fltGrid) {
            tf.validateAllRows();
            this.setPagingInfo(tf.validRowsIndex);
        }

        this.emitter.on(['after-filtering'], () => this.resetPagingInfo());
        this.emitter.on(['change-page'],
            (tf, pageNumber) => this.setPage(pageNumber));
        this.emitter.on(['change-page-results'],
            (tf, pageLength) => this.changeResultsPerPage(pageLength));

        this.initialized = true;
    }

    /**
     * Reset paging when filters are already instantiated
     * @param {Boolean} filterTable Execute filtering once paging instanciated
     */
    reset(filterTable = false) {
        var tf = this.tf;
        if (this.isEnabled()) {
            return;
        }
        this.enable();
        this.init();

        if (filterTable) {
            tf.filter();
        }
    }

    /**
     * Reset paging info from scratch after a filtering process
     */
    resetPagingInfo() {
        this.startPagingRow = 0;
        this.currentPageNb = 1;
        this.setPagingInfo(this.tf.validRowsIndex);
    }

    /**
     * Calculate number of pages based on valid rows
     * Refresh paging select according to number of pages
     * @param {Array} validRows Collection of valid rows
     */
    setPagingInfo(validRows) {
        var tf = this.tf;
        var mdiv = !this.pagingTgtId ? tf.mDiv : elm(this.pagingTgtId);
        var pgspan = elm(this.prfxPgSpan + tf.id);

        //store valid rows indexes
        tf.validRowsIndex = validRows || tf.getValidRows(true);

        //calculate nb of pages
        this.nbPages = Math.ceil(tf.validRowsIndex.length / this.pagingLength);
        //refresh page nb span
        pgspan.innerHTML = this.nbPages;
        //select clearing shortcut
        if (this.pageSelectorType === SELECT) {
            this.pagingSlc.innerHTML = '';
        }

        if (this.nbPages > 0) {
            mdiv.style.visibility = 'visible';
            if (this.pageSelectorType === SELECT) {
                for (var z = 0; z < this.nbPages; z++) {
                    var opt = createOpt(z + 1, z * this.pagingLength, false);
                    this.pagingSlc.options[z] = opt;
                }
            } else {
                //input type
                this.pagingSlc.value = this.currentPageNb;
            }

        } else {
            /*** if no results paging select and buttons are hidden ***/
            mdiv.style.visibility = 'hidden';
        }
        this.groupByPage(tf.validRowsIndex);
    }

    /**
     * Group table rows by page and display valid rows
     * @param  {Array} validRows Collection of valid rows
     */
    groupByPage(validRows) {
        var tf = this.tf;
        var rows = tf.tbl.rows;
        var startPagingRow = parseInt(this.startPagingRow, 10);
        var endPagingRow = startPagingRow + parseInt(this.pagingLength, 10);

        //store valid rows indexes
        if (validRows) {
            tf.validRowsIndex = validRows;
        }

        //this loop shows valid rows of current page
        for (var h = 0, len = tf.getValidRowsNb(true); h < len; h++) {
            var validRowIdx = tf.validRowsIndex[h];
            var r = rows[validRowIdx];
            var isRowValid = r.getAttribute('validRow');
            var rowDisplayed = false;

            if (h >= startPagingRow && h < endPagingRow) {
                if (isNull(isRowValid) || Boolean(isRowValid === 'true')) {
                    r.style.display = '';
                    rowDisplayed = true;
                }
            } else {
                r.style.display = NONE;
            }
            this.emitter.emit('row-paged', tf, validRowIdx, h, rowDisplayed);
        }

        // broadcast grouping by page
        this.emitter.emit('grouped-by-page', tf, this);
    }

    /**
     * Return the current page number
     * @return {Number} Page number
     */
    getPage() {
        return this.currentPageNb;
    }

    /**
     * Show page defined by passed argument (string or number):
     * @param {String}/{Number} cmd possible string values: 'next',
     *   'previous', 'last', 'first' or page number as per param
     */
    setPage(cmd) {
        var tf = this.tf;
        if (!tf.isInitialized() || !this.isEnabled()) {
            return;
        }
        var btnEvt = this.evt,
            cmdtype = typeof cmd;
        if (cmdtype === 'string') {
            switch (cmd.toLowerCase()) {
                case 'next':
                    btnEvt.next();
                    break;
                case 'previous':
                    btnEvt.prev();
                    break;
                case 'last':
                    btnEvt.last();
                    break;
                case 'first':
                    btnEvt.first();
                    break;
                default:
                    btnEvt.next();
                    break;
            }
        }
        else if (cmdtype === 'number') {
            this.changePage(cmd - 1);
        }
    }

    /**
     * Generates UI elements for the number of results per page drop-down
     */
    setResultsPerPage() {
        var tf = this.tf;
        var evt = this.evt;

        if (this.resultsPerPageSlc || !this.resultsPerPage) {
            return;
        }

        evt.slcResultsChange = (ev) => {
            this.onChangeResultsPerPage();
            ev.target.blur();
        };

        var slcR = createElm(SELECT, ['id', this.prfxSlcResults + tf.id]);
        slcR.className = this.resultsSlcCssClass;
        var slcRText = this.resultsPerPage[0],
            slcROpts = this.resultsPerPage[1];
        var slcRSpan = createElm(
            'span', ['id', this.prfxSlcResultsTxt + tf.id]);
        slcRSpan.className = this.resultsSpanCssClass;

        // results per page select is added to external element
        if (!this.resultsPerPageTgtId) {
            tf.setToolbar();
        }
        var targetEl = !this.resultsPerPageTgtId ?
            tf.rDiv : elm(this.resultsPerPageTgtId);
        slcRSpan.appendChild(createText(slcRText));

        var help = tf.feature('help');
        if (help && help.btn) {
            help.btn.parentNode.insertBefore(slcRSpan, help.btn);
            help.btn.parentNode.insertBefore(slcR, help.btn);
        } else {
            targetEl.appendChild(slcRSpan);
            targetEl.appendChild(slcR);
        }

        for (var r = 0; r < slcROpts.length; r++) {
            var currOpt = new Option(slcROpts[r], slcROpts[r], false, false);
            slcR.options[r] = currOpt;
        }
        addEvt(slcR, 'change', evt.slcResultsChange);
        this.resultsPerPageSlc = slcR;
    }

    /**
     * Remove number of results per page UI elements
     */
    removeResultsPerPage() {
        var tf = this.tf;
        if (!tf.isInitialized() || !this.resultsPerPageSlc ||
            !this.resultsPerPage) {
            return;
        }
        var slcR = this.resultsPerPageSlc,
            slcRSpan = elm(this.prfxSlcResultsTxt + tf.id);
        if (slcR) {
            removeElm(slcR);
        }
        if (slcRSpan) {
            removeElm(slcRSpan);
        }
        this.resultsPerPageSlc = null;
    }

    /**
     * Change the page according to passed index
     * @param  {Number} index Index of the page (0-n)
     */
    changePage(index) {
        var tf = this.tf;

        if (!this.isEnabled()) {
            return;
        }

        this.emitter.emit('before-page-change', tf, (index + 1));

        if (index === null) {
            index = this.pageSelectorType === SELECT ?
                this.pagingSlc.options.selectedIndex : this.pagingSlc.value - 1;
        }
        if (index >= 0 && index <= (this.nbPages - 1)) {
            if (this.onBeforeChangePage) {
                this.onBeforeChangePage.call(null, this, (index + 1));
            }
            this.currentPageNb = parseInt(index, 10) + 1;
            if (this.pageSelectorType === SELECT) {
                this.pagingSlc.options[index].selected = true;
            } else {
                this.pagingSlc.value = this.currentPageNb;
            }

            this.startPagingRow = (this.pageSelectorType === SELECT) ?
                this.pagingSlc.value : (index * this.pagingLength);

            this.groupByPage();

            if (this.onAfterChangePage) {
                this.onAfterChangePage.call(null, this, (index + 1));
            }
        }

        this.emitter.emit('after-page-change', tf, (index + 1));
    }

    changeResultsPerPage(val) {
        if (!this.isEnabled() || isNaN(val)) {
            return;
        }

        this.resultsPerPageSlc.value = val;
        this.onChangeResultsPerPage();
    }

    /**
     * Change rows according to page results drop-down
     */
    onChangeResultsPerPage() {
        var tf = this.tf;

        if (!this.isEnabled()) {
            return;
        }

        this.emitter.emit('before-page-length-change', tf);

        var slcR = this.resultsPerPageSlc;
        var slcIndex = slcR.selectedIndex;
        var slcPagesSelIndex = (this.pageSelectorType === SELECT) ?
            this.pagingSlc.selectedIndex :
            parseInt(this.pagingSlc.value - 1, 10);
        this.pagingLength = parseInt(slcR.options[slcIndex].value, 10);
        this.startPagingRow = this.pagingLength * slcPagesSelIndex;

        if (!isNaN(this.pagingLength)) {
            if (this.startPagingRow >= tf.nbFilterableRows) {
                this.startPagingRow = (tf.nbFilterableRows - this.pagingLength);
            }
            this.setPagingInfo();

            if (this.pageSelectorType === SELECT) {
                var slcIdx =
                    (this.pagingSlc.options.length - 1 <= slcPagesSelIndex) ?
                        (this.pagingSlc.options.length - 1) : slcPagesSelIndex;
                this.pagingSlc.options[slcIdx].selected = true;
            }
        }

        this.emitter.emit('after-page-length-change', tf, this.pagingLength);
    }

    /**
     * Re-set page nb at page re-load
     */
    resetPage() {
        var tf = this.tf;
        if (!this.isEnabled()) {
            return;
        }
        this.emitter.emit('before-reset-page', tf);
        var pgNb = tf.feature('store').getPageNb();
        if (pgNb !== '') {
            this.changePage((pgNb - 1));
        }
        this.emitter.emit('after-reset-page', tf, pgNb);
    }

    /**
     * Re-set page length value at page re-load
     */
    resetPageLength() {
        var tf = this.tf;
        if (!this.isEnabled()) {
            return;
        }
        this.emitter.emit('before-reset-page-length', tf);
        var pglenIndex = tf.feature('store').getPageLength();

        if (pglenIndex !== '') {
            this.resultsPerPageSlc.options[pglenIndex].selected = true;
            this.changeResultsPerPage();
        }
        this.emitter.emit('after-reset-page-length', tf, pglenIndex);
    }

    /**
     * Remove paging feature
     */
    destroy() {
        var tf = this.tf;

        if (!this.initialized) {
            return;
        }
        // btns containers
        var btnNextSpan = elm(this.prfxBtnNextSpan + tf.id);
        var btnPrevSpan = elm(this.prfxBtnPrevSpan + tf.id);
        var btnLastSpan = elm(this.prfxBtnLastSpan + tf.id);
        var btnFirstSpan = elm(this.prfxBtnFirstSpan + tf.id);
        //span containing 'Page' text
        var pgBeforeSpan = elm(this.prfxPgBeforeSpan + tf.id);
        //span containing 'of' text
        var pgAfterSpan = elm(this.prfxPgAfterSpan + tf.id);
        //span containing nb of pages
        var pgspan = elm(this.prfxPgSpan + tf.id);

        var evt = this.evt;

        if (this.pagingSlc) {
            if (this.pageSelectorType === SELECT) {
                removeEvt(this.pagingSlc, 'change', evt.slcPagesChange);
            }
            else if (this.pageSelectorType === INPUT) {
                removeEvt(this.pagingSlc, 'keypress', evt._detectKey);
            }
            removeElm(this.pagingSlc);
        }

        if (btnNextSpan) {
            removeEvt(btnNextSpan, 'click', evt.next);
            removeElm(btnNextSpan);
        }

        if (btnPrevSpan) {
            removeEvt(btnPrevSpan, 'click', evt.prev);
            removeElm(btnPrevSpan);
        }

        if (btnLastSpan) {
            removeEvt(btnLastSpan, 'click', evt.last);
            removeElm(btnLastSpan);
        }

        if (btnFirstSpan) {
            removeEvt(btnFirstSpan, 'click', evt.first);
            removeElm(btnFirstSpan);
        }

        if (pgBeforeSpan) {
            removeElm(pgBeforeSpan);
        }

        if (pgAfterSpan) {
            removeElm(pgAfterSpan);
        }

        if (pgspan) {
            removeElm(pgspan);
        }

        if (this.hasResultsPerPage) {
            this.removeResultsPerPage();
        }

        this.emitter.off(['after-filtering'], () => this.resetPagingInfo());
        this.emitter.off(['change-page'],
            (tf, pageNumber) => this.setPage(pageNumber));
        this.emitter.off(['change-page-results'],
            (tf, pageLength) => this.changeResultsPerPage(pageLength));

        this.pagingSlc = null;
        this.nbPages = 0;
        this.disable();
        this.initialized = false;
    }
}
