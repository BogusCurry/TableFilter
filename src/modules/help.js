import Dom from '../dom';
import Event from '../event';

export class Help{

    /**
     * Help UI component
     * @param {Object} tf TableFilter instance
     */
    constructor(tf){
        // Configuration object
        var f = tf.config();

        //id of custom container element for instructions
        this.tgtId = f.help_instructions_target_id || null;
        //id of custom container element for instructions
        this.contTgtId = f.help_instructions_container_target_id ||
            null;
        //defines help text
        this.instrText = f.help_instructions_text  ?
            f.help_instructions_text :
            'Use the filters above each column to filter and limit table ' +
            'data. Avanced searches can be performed by using the following ' +
            'operators: <br /><b>&lt;</b>, <b>&lt;=</b>, <b>&gt;</b>, ' +
            '<b>&gt;=</b>, <b>=</b>, <b>*</b>, <b>!</b>, <b>{</b>, <b>}</b>, ' +
            '<b>||</b>,<b>&amp;&amp;</b>, <b>[empty]</b>, <b>[nonempty]</b>, ' +
            '<b>rgx:</b><br/> Learn more:<br/>' +
            '<a href="https://github.com/koalyptus/TableFilter/wiki/' +
            '4.-Filter-operators" target="_blank">https://github.com/' +
            'koalyptus/TableFilter/wiki/4.-Filter-operators</a><hr/>';
        //defines help innerHtml
        this.instrHtml = f.help_instructions_html || null;
        //defines reset button text
        this.btnText = f.help_instructions_btn_text || '?';
        //defines reset button innerHtml
        this.btnHtml = f.help_instructions_btn_html || null;
        //defines css class for help button
        this.btnCssClass = f.help_instructions_btn_css_class || 'helpBtn';
        //defines css class for help container
        this.contCssClass = f.help_instructions_container_css_class ||
            'helpCont';
        //help button element
        this.btn = null;
         //help content div
        this.cont = null;
        this.defaultHtml = '<div class="helpFooter"><h4>TableFilter ' +
            'v. '+ tf.version +'</h4>' +
            '<a href="https://github.com/koalyptus/TableFilter/" ' +
            ' target="_blank">https://github.com/koalyptus/TableFilter/</a>' +
            '<br/><span>&copy;2015-'+ tf.year +' Max Guglielmi.</span>' +
            '<div align="center" style="margin-top:8px;">' +
            '<a href="javascript:void(0);" class="close">Close</a></div></div>';

        //id prefix for help elements
        this.prfxHelpSpan = 'helpSpan_';
        //id prefix for help elements
        this.prfxHelpDiv = 'helpDiv_';

        this.tf = tf;
    }

    init(){
        if(this.btn){
            return;
        }

        var tf = this.tf;

        var helpspan = Dom.create('span',['id', this.prfxHelpSpan+tf.id]);
        var helpdiv = Dom.create('div',['id', this.prfxHelpDiv+tf.id]);

        //help button is added to defined element
        if(!this.tgtId){
            tf.setToolbar();
        }
        var targetEl = !this.tgtId ?
            tf.rDiv : Dom.id(this.tgtId);
        targetEl.appendChild(helpspan);

        var divContainer = !this.contTgtId ?
                helpspan : Dom.id(this.contTgtId);

        if(!this.btnHtml){
            divContainer.appendChild(helpdiv);
            var helplink = Dom.create('a', ['href', 'javascript:void(0);']);
            helplink.className = this.btnCssClass;
            helplink.appendChild(Dom.text(this.btnText));
            helpspan.appendChild(helplink);
            Event.add(helplink, 'click', () => { this.toggle(); });
        } else {
            helpspan.innerHTML = this.btnHtml;
            var helpEl = helpspan.firstChild;
            Event.add(helpEl, 'click', () => { this.toggle(); });
            divContainer.appendChild(helpdiv);
        }

        if(!this.instrHtml){
            helpdiv.innerHTML = this.instrText;
            helpdiv.className = this.contCssClass;
            Event.add(helpdiv, 'dblclick', () => { this.toggle(); });
        } else {
            if(this.contTgtId){
                divContainer.appendChild(helpdiv);
            }
            helpdiv.innerHTML = this.instrHtml;
            if(!this.contTgtId){
                helpdiv.className = this.contCssClass;
                Event.add(helpdiv, 'dblclick', () => { this.toggle(); });
            }
        }
        helpdiv.innerHTML += this.defaultHtml;
        Event.add(helpdiv, 'click', () => { this.toggle(); });

        this.cont = helpdiv;
        this.btn = helpspan;
    }

    /**
     * Toggle help pop-up
     */
    toggle(){
        if(!this.cont){
            return;
        }
        var divDisplay = this.cont.style.display;
        if(divDisplay==='' || divDisplay==='none'){
            this.cont.style.display = 'inline';
            // TODO: use CSS instead for element positioning
            // var btnLeft = Dom.position(this.btn).left;
            // if(!this.contTgtId){
            //     this.cont.style.left =
            //         (btnLeft - this.cont.clientWidth + 25) + 'px';
            // }
        } else {
            this.cont.style.display = 'none';
        }
    }

    /**
     * Remove help UI
     */
    destroy(){
        if(!this.btn){
            return;
        }
        this.btn.parentNode.removeChild(this.btn);
        this.btn = null;
        if(!this.cont){
            return;
        }
        this.cont.parentNode.removeChild(this.cont);
        this.cont = null;
    }

}
