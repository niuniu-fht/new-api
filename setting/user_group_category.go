package setting

import (
	"encoding/json"
	"maps"
	"sync"

	"github.com/QuantumNous/new-api/common"
)

// userGroupCategories maps a group name to the catalog category label shown
// to users in the API-key group picker (e.g. "GPT", "Claude", "Grok").
// Groups without an entry fall back to the console's built-in rules.
var userGroupCategories = map[string]string{}
var userGroupCategoriesMutex sync.RWMutex

func GetUserGroupCategory(groupName string) (string, bool) {
	userGroupCategoriesMutex.RLock()
	defer userGroupCategoriesMutex.RUnlock()

	category, ok := userGroupCategories[groupName]
	return category, ok
}

func GetUserGroupCategoriesCopy() map[string]string {
	userGroupCategoriesMutex.RLock()
	defer userGroupCategoriesMutex.RUnlock()

	categories := make(map[string]string)
	maps.Copy(categories, userGroupCategories)
	return categories
}

func UserGroupCategories2JSONString() string {
	userGroupCategoriesMutex.RLock()
	defer userGroupCategoriesMutex.RUnlock()

	jsonBytes, err := json.Marshal(userGroupCategories)
	if err != nil {
		common.SysLog(common.LogText("error marshalling group categories: %s", err.Error()))
	}
	return string(jsonBytes)
}

func UpdateUserGroupCategoriesByJSONString(jsonStr string) error {
	userGroupCategoriesMutex.Lock()
	defer userGroupCategoriesMutex.Unlock()

	userGroupCategories = make(map[string]string)
	return json.Unmarshal([]byte(jsonStr), &userGroupCategories)
}
