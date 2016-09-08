Summary:            A plugin which handles experimental authentication with user certificate/smart card
Name:               ipa-experimental-x509-auth-plugin
Version:            1.1
Release:            1%{?dist}
BuildArch:          noarch

License:            GPLv2+
Source:             %{name}-%{version}.tar.gz
URL:                http://www.freeipa.org/page/V4/External_Authentication/Setup

Requires:           mod_lookup_identity
Requires:           sssd-dbus
Requires:           freeipa-server >= 4.4.0
Conflicts:          freeipa-server >= 4.5.0

%description
The plugin into FreeIPA UI. It adds a button into interface and a configuration file to set up apache.

%global debug_package %{nil}

%prep
%setup -q

%build

%install
mkdir -p %{buildroot}%{_usr}/share/ipa/ui/js/plugins/ipa-experimental-x509-auth-plugin %{buildroot}%{_sysconfdir}/httpd/conf.d %{buildroot}%{_sbindir}
install ipa-experimental-x509-auth-plugin.js %{buildroot}%{_usr}/share/ipa/ui/js/plugins/ipa-experimental-x509-auth-plugin/ipa-experimental-x509-auth-plugin.js
install xx-ipa-experimental-x509-auth.conf %{buildroot}%{_sysconfdir}/httpd/conf.d/xx-ipa-experimental-x509-auth.conf
install post-install.py %{buildroot}%{_sbindir}/ipa-experimental-x509-auth-enable

%files
%{_usr}/share/ipa/ui/js/plugins/ipa-experimental-x509-auth-plugin/ipa-experimental-x509-auth-plugin.js
%{_sbindir}/ipa-experimental-x509-auth-enable
%{_sysconfdir}/httpd/conf.d/xx-ipa-experimental-x509-auth.conf

%post
%{_sbindir}/ipa-experimental-x509-auth-enable

%changelog
* Wed Aug 24 2016 Tiboris <tibor.dudlak@gmail.com>
- Changed post-install shell script to python script
* Thu Aug 11 2016 Tiboris <tibor.dudlak@gmail.com>
- Created
