# Pages Architecture Overview

This directory serves as a blueprinting system for the application's pages and major UI features. It is not meant to contain the actual page components, but rather the **architectural and requirements documentation** for them.

## The Blueprinting Workflow

1.  **Copy the Template**: Before starting a new page (e.g., "User Settings"), create a new directory by copying the `_template` folder:
    ```bash
    cp -r pages-architecture/_template pages-architecture/user-settings
    ```

2.  **Fill out the Blueprints**: Populate the markdown files within the new `user-settings` directory. This step forces a clear definition of requirements *before* development begins.

3.  **Link to the Task**: In the `Task Master` task for building this new page, reference the `pages-architecture/user-settings` directory so the AI has all the necessary architectural context.

This process ensures that every feature is well-planned and its relationship to the core "Master" documents and `Tier-2` patterns is clearly understood. 