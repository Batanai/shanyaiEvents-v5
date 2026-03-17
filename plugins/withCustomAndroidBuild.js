const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

module.exports = function withCustomAndroidBuild(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const appBuildGradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');

      if (fs.existsSync(appBuildGradlePath)) {
        let contents = fs.readFileSync(appBuildGradlePath, 'utf8');
        
        // 1. Add version management functions before android block
        if (!contents.includes('getMyVersionCode')) {
          const versionFunctions = `def baseVersionCode = 20000

def getMyVersionCode = { ->
    def increment = project.hasProperty('versionCode') ? versionCode.toInteger() : 0
    return baseVersionCode + increment
}

def getMyVersionName = { ->
    return project.hasProperty('versionName') ? versionName : "2.0.0"
}

`;
          // Find the line with jscFlavor and insert after it
          const jscFlavorLine = "def jscFlavor = 'io.github.react-native-community:jsc-android:2026004.+'";
          if (contents.includes(jscFlavorLine)) {
            contents = contents.replace(
              jscFlavorLine + '\n',
              jscFlavorLine + '\n\n' + versionFunctions
            );
          }
        }

        // 2. Replace versionCode and versionName in defaultConfig
        if (!contents.includes('versionCode getMyVersionCode()')) {
          contents = contents.replace(
            /versionCode\s+\d+/,
            'versionCode getMyVersionCode()'
          );
        }
        
        if (!contents.includes('versionName getMyVersionName()')) {
          contents = contents.replace(
            /versionName\s+"[^"]+"/,
            'versionName getMyVersionName()'
          );
        }

        // 3. Add release signing config to signingConfigs block
        if (!contents.includes('CM_KEYSTORE_PATH')) {
          // Find the closing brace of debug signing config
          const debugConfigEnd = contents.indexOf("keyPassword 'android'\n        }\n    }");
          
          if (debugConfigEnd !== -1) {
            const releaseConfig = `
        release {
            if (System.getenv()["CI"]) {
                storeFile file(System.getenv()["CM_KEYSTORE_PATH"])
                storePassword System.getenv()["CM_KEYSTORE_PASSWORD"]
                keyAlias System.getenv()["CM_KEY_ALIAS"]
                keyPassword System.getenv()["CM_KEY_PASSWORD"]
            } else {
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }`;
            
            // Insert release config before the closing braces
            const insertPosition = debugConfigEnd + "keyPassword 'android'\n        }".length;
            contents = contents.slice(0, insertPosition) + releaseConfig + contents.slice(insertPosition);
          }
        }

        // 4. Update release buildType to use release signing
        if (!contents.includes('signingConfig signingConfigs.release')) {
          contents = contents.replace(
            /(release\s*\{[^}]*?)signingConfig signingConfigs\.debug/,
            '$1signingConfig signingConfigs.release'
          );
        }

        fs.writeFileSync(appBuildGradlePath, contents);
        console.log('✅ Applied custom Android build configuration');
      }

      return config;
    },
  ]);
};
