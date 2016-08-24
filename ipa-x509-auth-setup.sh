#!/bin/bash
set -e
yum install -y mod_auth_gssapi mod_lookup_identity mod_nss sssd-dbus
TMP=$(mktemp -p /etc/sssd sssd.conf.XXXX)
python <<EOF
#!/usr/bin/python
import SSSDConfig
config_handle = SSSDConfig.SSSDConfig()
config_handle.import_config('/etc/sssd/sssd.conf')
try:
    config_handle.new_service('ifp')
except SSSDConfig.ServiceAlreadyExists:
    pass
config_handle.activate_service('ifp')
config_handle.write('$TMP')
EOF
cp $TMP /etc/sssd/sssd.conf
rm -f $TMP
systemctl restart sssd
setsebool -P httpd_dbus_sssd on
kadmin.local -q "modprinc +ok_to_auth_as_delegate HTTP/"$(hostname)
sed -i '/^#.*/s/^#//' /etc/httpd/conf.modules.d/55-lookup_identity.conf
ln -fs /usr/share/ipa/xx-ipa-cert-auth.conf /etc/httpd/conf.d/xx-ipa-cert-auth.conf
ln -fs /usr/share/ipa/ui/js/plugins-dist/cert_auth /usr/share/ipa/ui/js/plugins/cert_auth
systemctl restart httpd
