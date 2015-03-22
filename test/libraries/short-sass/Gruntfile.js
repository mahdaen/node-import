module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            build: {
                files: {
                    'dist/short-sass.scss': [
                        "src/util/variables.scss",
                        "src/util/functions.scss",

                        // Importing Core Components
                        "src/core/core.scss",
                        "src/core/default.scss",
                        "src/core/common.scss",

                        "src/core/typography.scss",
                        "src/core/alignment.scss",
                        "src/core/animation.scss",
                        "src/core/display.scss",
                        "src/core/grid.scss",
                        "src/core/transform.scss",
                        "src/core/position.scss",
                        "src/core/layout.scss",

                        "src/core/border.scss",
                        "src/core/shadow.scss",
                        "src/core/gradient.scss",
                        "src/core/breakpoint.scss",

                        // Importing Util Components
                        "src/util/normalize.scss",
                        "src/util/reset.scss",
                        "src/util/printer.scss",
                        "src/util/tweaks.scss"
                    ]
                }
            }
        },
        sass: {
            test: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'test/test.css': 'test/test.scss'
                }
            }
        },
        watch: {
            options: {
                livereload: 1849
            },
            origin: {
                files: ['src/**/*.scss', 'test/**/*.scss'],
                tasks: ['concat', 'sass']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('default', ['concat', 'sass', 'watch']);
}