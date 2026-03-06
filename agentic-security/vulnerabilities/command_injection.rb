
# EXAMPLE: DO NOT USE IN PRODUCTION
# This is a demonstration file showing what NOT to do

# Critical: Command Injection vulnerability
def ping_host(hostname)
  # Vulnerable to command injection
  result = `ping -c 1 #{hostname}`
  return result
end

# Medium: Command Injection in system call
def fetch_user_data(username)
  # Vulnerable to command injection
  system("grep #{username} /var/log/users.log")
end

# The correct way would be:
# def ping_host_safe(hostname)
#   require 'open3'
#   stdout, stderr, status = Open3.capture3('ping', '-c', '1', hostname)
#   return stdout if status.success?
#   return stderr
# end

if __FILE__ == $0
  puts "This is an example vulnerability - do not use in real applications"
end
