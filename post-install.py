#!/usr/bin/python3
from shutil import copyfile
from subprocess import call
from os import sys
import SSSDConfig

sssd_conf = '/etc/sssd/sssd.conf'
lookup_conf = '/etc/httpd/conf.modules.d/55-lookup_identity.conf'
commands = (
    ['systemctl', 'restart', 'sssd'],
    ['setsebool', '-P', 'httpd_dbus_sssd', 'on'],
    ['sed', '-i', '/^#.*/s/^#//', lookup_conf],
    ['systemctl', 'restart', 'httpd']
)


def run(*cmd_params):

    ret = 0
    try:
        cmd = cmd_params[0]
        print(cmd)
        ret = call(cmd_params)
    except Exception as e:
        print("Execution of " + cmd + " failed: " + str(e), file=sys.stderr)
        ret = -1
    return ret


def configure_sssd():

    copyfile(conf, orig.conf+'.orig')

    config_handle = SSSDConfig.SSSDConfig()
    config_handle.import_config(sssd_conf)
    try:
        config_handle.new_service('ifp')
    except SSSDConfig.ServiceAlreadyExists:
        pass
    config_handle.activate_service('ifp')
    config_handle.write(sssd_conf)


def main():
    configure_sssd()
    for command in commands:
        ret = run(*command)
        if ret != 0:
            return ret
    return 0


if __name__ == '__main__':
    exit(main())
