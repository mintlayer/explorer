import { NextResponse } from 'next/server';

const ADDRESS_REGEX = /^mm?tc1[a-zA-Z0-9]{40}$/;

// Define the response types based on Micro3 documentation
// @link https://micro3.notion.site/API-Technical-Documentation-e5c2a5becfc04ed09adf19788575cbb7
interface SuccessResponse {
  data: {
    result: boolean;
  };
}

interface ErrorResponse {
  error: {
    code: string | number;
    message: string;
  };
  data: {
    result: boolean;
  };
}

// GET handler (Micro3 specifies GET requests)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    // Check if address is provided
    if (!address) {
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            code: 'MISSING_ADDRESS',
            message: 'Address parameter is required',
          },
          data: {
            result: false,
          },
        },
        { status: 400 }
      );
    }

    // Validate address format
    if (!ADDRESS_REGEX.test(address)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            code: 'INVALID_ADDRESS',
            message: 'Address must start with "mtc1" followed by 40 alphanumeric characters',
          },
          data: {
            result: false,
          },
        },
        { status: 400 }
      );
    }

    const isTaskCompleted = true; // All provided addresses are valid

    return NextResponse.json<SuccessResponse>(
      {
        data: {
          result: isTaskCompleted,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json<ErrorResponse>(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error occurred',
        },
        data: {
          result: false,
        },
      },
      { status: 500 }
    );
  }
}
