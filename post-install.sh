#!/bin/bash
set -e
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
sed -i '/^#.*/s/^#//' /etc/httpd/conf.modules.d/55-lookup_identity.conf
systemctl restart httpd
