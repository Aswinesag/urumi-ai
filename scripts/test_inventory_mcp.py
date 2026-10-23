
import asyncio
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client


async def main():
    async with streamable_http_client(
        "http://127.0.0.1:8002/mcp"
    ) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()

            result = await session.call_tool(
                "get_stock",
                {"sku": "URUMI-TSHIRT-001"},
            )

            print("get_stock result:")
            for content in result.content:
                if hasattr(content, "text"):
                    print(content.text)

            print("Tool reported an error:", result.is_error)


if __name__ == "__main__":
    asyncio.run(main())