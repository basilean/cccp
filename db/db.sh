#!/usr/bin/bash
TARGET=${1:-db.json}
LS="/usr/bin/ls"
YQ="/usr/bin/yq"

function reduce {
        ${YQ} -oj ea '. as $i ireduce ({}; . + {($i | filename | split("/").-1 | split(".").0): $i} )' ${1} > ${2}
}

for TABLE in $(${LS} -d */); do
        NAME=${TABLE:0:-1}
        echo ${NAME}
        reduce "${TABLE}*.yaml" "${NAME}.json"
done;
reduce "*.json" ${TARGET}
