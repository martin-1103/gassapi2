import { ContentAssertions } from './content-assertions';
import { HeaderAssertions } from './header-assertions';
import { JsonAssertions } from './json-assertions';
import { StatusAssertions } from './status-assertions';
import { TestContext, JsonValue } from './types';

/**
 * Factory class to create different types of assertions based on the actual value and context
 */
export class AssertionFactory {
  static createJsonAssertions(
    actual: JsonValue,
    context: TestContext,
  ): JsonAssertions {
    return new JsonAssertions(actual, context);
  }

  static createHeaderAssertions(
    actual: JsonValue,
    context: TestContext,
  ): HeaderAssertions {
    return new HeaderAssertions(actual, context);
  }

  static createStatusAssertions(
    actual: JsonValue,
    context: TestContext,
  ): StatusAssertions {
    return new StatusAssertions(actual, context);
  }

  static createContentAssertions(
    actual: JsonValue,
    context: TestContext,
  ): ContentAssertions {
    return new ContentAssertions(actual, context);
  }

  /**
   * Creates appropriate assertion instances based on the kind of actual value
   */
  static createAllAssertions(
    actual: JsonValue,
    context: TestContext,
  ): {
    json: JsonAssertions;
    header: HeaderAssertions;
    status: StatusAssertions;
    content: ContentAssertions;
  } {
    return {
      json: new JsonAssertions(actual, context),
      header: new HeaderAssertions(actual, context),
      status: new StatusAssertions(actual, context),
      content: new ContentAssertions(actual, context),
    };
  }
}
