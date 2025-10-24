import { TestContext } from './types';
import { JsonAssertions } from './json-assertions';
import { HeaderAssertions } from './header-assertions';
import { StatusAssertions } from './status-assertions';
import { ContentAssertions } from './content-assertions';

/**
 * Factory class to create different types of assertions based on the actual value and context
 */
export class AssertionFactory {
  static createJsonAssertions(actual: any, context: TestContext): JsonAssertions {
    return new JsonAssertions(actual, context);
  }

  static createHeaderAssertions(actual: any, context: TestContext): HeaderAssertions {
    return new HeaderAssertions(actual, context);
  }

  static createStatusAssertions(actual: any, context: TestContext): StatusAssertions {
    return new StatusAssertions(actual, context);
  }

  static createContentAssertions(actual: any, context: TestContext): ContentAssertions {
    return new ContentAssertions(actual, context);
  }

  /**
   * Creates appropriate assertion instances based on the kind of actual value
   */
  static createAllAssertions(actual: any, context: TestContext) {
    return {
      json: new JsonAssertions(actual, context),
      header: new HeaderAssertions(actual, context),
      status: new StatusAssertions(actual, context),
      content: new ContentAssertions(actual, context)
    };
  }
}