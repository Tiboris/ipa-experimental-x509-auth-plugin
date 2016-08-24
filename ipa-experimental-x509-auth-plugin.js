/*  Authors:
 *    Petr Vobornik <pvoborni@redhat.com>
 *    Tibor Dudlák <tdudlak@redhat.com>
 *
 * Copyright (C) 2016 Red Hat
 * see file 'COPYING' for use and warranty information
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/*
    Plugin adds a button-link with aside text to FreeIPA login screen to
    support x509 authentication for experimental use

    Disabled by default

    Tested against FreeIPA 4.3 and 4.4

    Limitation: only one such plugin can be installed - one can override
    functionality of the other
 */

define([
        'dojo/Deferred',
        'dojo/dom-construct',
        'dojo/_base/declare',
        'freeipa/jquery',
        'freeipa/_base/Spec_mod',
        'freeipa/ipa',
        'freeipa/auth',
        'freeipa/phases',
        'freeipa/reg',
        'freeipa/plugins/login',
        'freeipa/widgets/LoginScreen'
        ],
            function(Deferred, construct, declare, $, SpecMod, IPA, auth, phases,
                      reg, mod_login, LoginScreen) {

var exp = {};

exp.CustomLoginScreen = declare([LoginScreen], {

    crtauth_btn_node: null,

    auth_failed: "Authentication with personal certificate failed",

    msg: "<p><i class=\"fa fa-info-circle\"></i> To login with <strong>Smart Card</strong>," +
          " please make sure you have valid personal certificate. </p>",

    login_url: '/ipa/session/login_x509',

    render_buttons: function(container) {

        this.crtauth_btn_node = IPA.button({
            name: 'crtauth',
            title:"Login using personal certificate",
            label: "Smart Card Login",
            button_class: 'btn btn-link',
            click: this.crt_login.bind(this)
        })[0];

        construct.place(this.crtauth_btn_node, container);
        construct.place(document.createTextNode(" "), container);

        this.inherited(arguments);
    },

    crt_login: function() {

        this.lookup_credentials().then(function(status) {
            if (status === 200) {
                this.emit('logged_in');
            } else {
                var val_summary = this.get_widget('validation');
                val_summary.add_error('login', this.auth_failed);
            }
        }.bind(this));
    },

    lookup_credentials: function() {

        var status;
        var d = new Deferred();

        function error_handler(xhr, text_status, error_thrown) {
            d.resolve(xhr.status);
            IPA.hide_activity_icon();
        }

        function success_handler(data, text_status, xhr) {
            auth.current.set_authenticated(true, 'kerberos');
            d.resolve(xhr.status);
            IPA.hide_activity_icon();
        }

        var request = {
            url: this.login_url,
            cache: false,
            type: "GET",
            success: success_handler,
            error: error_handler
        };
        IPA.display_activity_icon();
        $.ajax(request);

        return d.promise;
    },

    show_login_view: function() {

        this.inherited(arguments);
        this.set_visible_buttons(['crtauth', 'sync', 'login']);
    },

    set_login_aside_text: function() {

        this.inherited(arguments);
        var aside = this.aside;
        aside += this.msg;
        this.set('aside', aside);
    }
});


exp.replace_login_screen_spec = function(entity) {

    var mod = new SpecMod();

    var diff = {
        $replace: [
            [
                'widgets',
                [[{ name: 'login_screen'},
                {
                    $type: 'custom_login_screen',
                    name: 'login_screen'
                }]]
            ]
        ]
    };
    mod.mod(mod_login.facet_spec, diff);
};

exp.override = function() {

    exp.replace_login_screen_spec();
};

exp.register = function() {

    var w = reg.widget;
    w.register('custom_login_screen', exp.CustomLoginScreen );
};

phases.on('registration', exp.register);
phases.on('customization', exp.override);

return exp;
});
